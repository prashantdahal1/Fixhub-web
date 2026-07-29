import { MatchingScoreModel, type IMatchingScore } from "../../models/ai-matching.model.js";
import { ServiceModel, type IService } from "../../models/service.model.js";
import { UserModel, type IUser } from "../../models/user.model.js";
import mongoose from "mongoose";

export interface MatchingRequest {
  customerId: string;
  serviceCategory: string;
  customerLocation?: {
    city: string;
    province: string;
    coordinates?: { lat: number; lng: number };
  };
  maxResults?: number;
}

export interface ProfessionalMatch {
  professionalId: string;
  serviceId: string;
  serviceSlug?: string;
  professionalName: string;
  serviceName: string;
  overallScore: number;
  locationScore: number;
  ratingScore: number;
  expertiseScore: number;
  availabilityScore: number;
  priceScore: number;
  factors: any;
}

export class AIMatchingService {
  /**
   * Calculate distance score based on location proximity
   * Enhanced for Kathmandu neighborhood-level matching
   * @param customerCity 
   * @param professionalCity 
   * @returns Score 0-100
   */
  private calculateLocationScore(customerCity: string, professionalCity: string): number {
    if (!customerCity || !professionalCity) return 50; // Neutral score if location data missing
    
    const customerCityLower = customerCity.toLowerCase().trim();
    const professionalCityLower = professionalCity.toLowerCase().trim();
    
    // Kathmandu neighborhoods for precise matching
    const kathmanduNeighborhoods = [
      'thamel', 'lazimpat', 'baluwatar', 'baneshwor', 'maharajgunj',
      'new baneshwor', 'minbhawan', 'putalisadak', 'dillibazar', 'buddhanagar',
      'kalanki', 'soaltee', 'tripureshwor', 'kupondol', 'swayambhu',
      'sanepa', 'naxal', 'maharajgunj', 'chabahil', 'boudha',
      'jorpati', 'gongabu', 'kalimati', 'tekhu', 'thapathali',
      'kirtipur', 'bhaktapur', 'lalitpur', 'patan', 'jawalakhel'
    ];
    
    // Check if both are in Kathmandu
    const isCustomerKathmandu = customerCityLower.includes('kathmandu') || 
                                  kathmanduNeighborhoods.some(n => customerCityLower.includes(n));
    const isProKathmandu = professionalCityLower.includes('kathmandu') || 
                           kathmanduNeighborhoods.some(n => professionalCityLower.includes(n));
    
    if (isCustomerKathmandu && isProKathmandu) {
      // Both in Kathmandu - check for neighborhood match
      const customerNeighborhood = kathmanduNeighborhoods.find(n => customerCityLower.includes(n));
      const proNeighborhood = kathmanduNeighborhoods.find(n => professionalCityLower.includes(n));
      
      if (customerNeighborhood && proNeighborhood) {
        if (customerNeighborhood === proNeighborhood) {
          return 100; // Same neighborhood - perfect match
        }
        // Different neighborhoods in Kathmandu - still good
        return 85; 
      }
      
      // Both in Kathmandu but no specific neighborhood data
      return 90; // High score for same city
    }
    
    // Check for exact city match
    if (customerCityLower === professionalCityLower) {
      return 100; // Same city - perfect match
    }
    
    // Check for partial matches in valley area
    if ((customerCityLower.includes('kathmandu') && professionalCityLower.includes('kathmandu')) ||
        (customerCityLower.includes('valley') && professionalCityLower.includes('valley'))) {
      return 75; // Same valley area
    }
    
    // Check if one includes the other
    if (customerCityLower.includes(professionalCityLower) || 
        professionalCityLower.includes(customerCityLower)) {
      return 70; // Partial match
    }
    
    return 25; // Different cities - low score
  }

  /**
   * Calculate rating score based on professional's average rating and review count
   * @param averageRating 
   * @param reviewCount 
   * @returns Score 0-100
   */
  private calculateRatingScore(averageRating: number, reviewCount: number): number {
    if (!averageRating || averageRating === 0) return 0;
    
    // Rating score: 5 stars = 100 points, scaled linearly
    const ratingScore = (averageRating / 5) * 100;
    
    // Review count bonus: more reviews = more reliable
    let reviewBonus = 0;
    if (reviewCount >= 50) reviewBonus = 10;
    else if (reviewCount >= 20) reviewBonus = 7;
    else if (reviewCount >= 10) reviewBonus = 5;
    else if (reviewCount >= 5) reviewBonus = 3;
    
    return Math.min(100, ratingScore + reviewBonus);
  }

  /**
   * Calculate expertise score based on service category match
   * @param requestedCategory 
   * @param serviceCategory 
   * @param professionalRating 
   * @returns Score 0-100
   */
  private calculateExpertiseScore(
    requestedCategory: string, 
    serviceCategory: string,
    professionalRating: number
  ): number {
    if (!requestedCategory || !serviceCategory) return 50;
    
    const requestedLower = requestedCategory.toLowerCase().trim();
    const serviceLower = serviceCategory.toLowerCase().trim();
    
    if (requestedLower === serviceLower) {
      // Perfect category match - boost by professional's rating
      const ratingBoost = professionalRating ? (professionalRating / 5) * 20 : 0;
      return 80 + ratingBoost;
    }
    
    // Check for related categories
    const relatedCategories: Record<string, string[]> = {
      electrician: ['appliance_repair', 'ac_repair'],
      plumber: ['geyser', 'appliance_repair'],
      ac_repair: ['electrician', 'appliance_repair'],
      carpenter: ['other'],
      painter: ['other'],
      cleaner: ['other'],
      geyser: ['plumber', 'electrician'],
      appliance_repair: ['electrician', 'plumber', 'ac_repair'],
    };
    
    if (relatedCategories[requestedLower]?.includes(serviceLower)) {
      return 60; // Related category - moderate score
    }
    
    return 20; // Unrelated category - low score
  }

  /**
   * Calculate availability score based on professional's booking patterns
   * @param professionalId 
   * @returns Score 0-100
   */
  private async calculateAvailabilityScore(professionalId: string): Promise<number> {
    try {
      // This would query the booking model to check recent booking patterns
      // For now, return a default score
      // In a real implementation, you would:
      // 1. Check if professional has active bookings in the requested time slot
      // 2. Analyze their typical availability patterns
      // 3. Check their response time to booking requests
      
      return 70; // Default availability score
    } catch (error) {
      return 50; // Neutral score on error
    }
  }

  /**
   * Calculate price competitiveness score
   * @param servicePrice 
   * @param averageMarketPrice 
   * @returns Score 0-100
   */
  private calculatePriceScore(servicePrice: number, averageMarketPrice?: number): number {
    if (!servicePrice) return 50;
    
    if (!averageMarketPrice) {
      // If no market data, assume reasonable pricing
      return 70;
    }
    
    const priceRatio = servicePrice / averageMarketPrice;
    
    if (priceRatio <= 0.8) return 95; // Very competitive pricing
    if (priceRatio <= 0.9) return 85; // Competitive pricing
    if (priceRatio <= 1.1) return 75; // Market rate
    if (priceRatio <= 1.3) return 50; // Slightly above market
    return 30; // Expensive
  }

  /**
   * Calculate average market price for a service category
   * @param category 
   * @returns Average price
   */
  private async getAverageMarketPrice(category: string): Promise<number> {
    try {
      const services = await ServiceModel.find({ 
        category: category.toLowerCase() as any,
        isActive: true 
      }).select('basePrice');
      
      if (services.length === 0) return 0;
      
      const total = services.reduce((sum: number, service: IService) => sum + service.basePrice, 0);
      return total / services.length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Main matching algorithm - finds best professionals for a service request
   * @param request 
   * @returns Array of matched professionals with scores
   */
  async findBestMatches(request: MatchingRequest): Promise<ProfessionalMatch[]> {
    const { customerId, serviceCategory, customerLocation, maxResults = 5 } = request;

    try {
      // Find all active services in the requested category
      const services = await ServiceModel.find({
        category: serviceCategory.toLowerCase() as any,
        isActive: true,
      }).populate('professionalId');

      if (!services || services.length === 0) {
        return [];
      }

      // Get customer location - handle case where customer might not exist
      let customerCity = customerLocation?.city || '';
      let customerProvince = customerLocation?.province || '';
      
      if (!customerCity && customerId) {
        try {
          const customer = await UserModel.findById(customerId).select('city province');
          if (customer) {
            customerCity = customer.city || '';
            customerProvince = customer.province || '';
          }
        } catch (error) {
          // Customer not found, use provided location or default
          console.log('Customer not found, using provided location');
        }
      }

      // Calculate average market price for this category
      const averageMarketPrice = await this.getAverageMarketPrice(serviceCategory);

      // Calculate scores for each professional
      const matches: ProfessionalMatch[] = [];
      
      for (const service of services) {
        const professional = service.professionalId as any;
        
        if (!professional || professional.role !== 'professional') continue;

        // Calculate individual scores
        const locationScore = this.calculateLocationScore(customerCity, professional.city || '');
        const ratingScore = this.calculateRatingScore(
          professional.averageRating || 0,
          professional.reviewCount || 0
        );
        const expertiseScore = this.calculateExpertiseScore(
          serviceCategory,
          service.category,
          professional.averageRating || 0
        );
        const availabilityScore = await this.calculateAvailabilityScore(professional._id);
        const priceScore = this.calculatePriceScore(service.basePrice, averageMarketPrice);

        // Calculate weighted overall score
        const weights = {
          location: 0.25,
          rating: 0.30,
          expertise: 0.25,
          availability: 0.10,
          price: 0.10,
        };

        const overallScore = 
          (locationScore * weights.location) +
          (ratingScore * weights.rating) +
          (expertiseScore * weights.expertise) +
          (availabilityScore * weights.availability) +
          (priceScore * weights.price);

        const factors = {
          distance: locationScore,
          rating: professional.averageRating || 0,
          reviewCount: professional.reviewCount || 0,
          categoryMatch: serviceCategory.toLowerCase() === service.category.toLowerCase(),
          availability: availabilityScore,
          priceCompetitiveness: priceScore,
        };

        matches.push({
          professionalId: professional._id.toString(),
          serviceId: service._id.toString(),
          serviceSlug: service.slug,
          professionalName: `${professional.firstName} ${professional.lastName}`,
          serviceName: service.title,
          overallScore: Math.round(overallScore),
          locationScore: Math.round(locationScore),
          ratingScore: Math.round(ratingScore),
          expertiseScore: Math.round(expertiseScore),
          availabilityScore: Math.round(availabilityScore),
          priceScore: Math.round(priceScore),
          factors,
        });

        // Save matching score to database for analytics (best-effort, never crash the main flow)
        try {
          if (customerId && mongoose.Types.ObjectId.isValid(customerId)) {
            await this.saveMatchingScore({
              customerId: new mongoose.Types.ObjectId(customerId),
              serviceId: service._id,
              professionalId: professional._id,
              overallScore: Math.round(overallScore),
              locationScore: Math.round(locationScore),
              ratingScore: Math.round(ratingScore),
              expertiseScore: Math.round(expertiseScore),
              availabilityScore: Math.round(availabilityScore),
              priceScore: Math.round(priceScore),
              factors,
            });
          }
        } catch (saveErr) {
          console.warn('saveMatchingScore skipped:', saveErr);
        }
      }

      // Sort by overall score and return top results
      return matches
        .sort((a, b) => b.overallScore - a.overallScore)
        .slice(0, maxResults);

    } catch (error) {
      console.error('AI Matching Error:', error);
      throw new Error('Failed to calculate AI matches');
    }
  }

  /**
   * Save matching score to database for analytics
   * @param scoreData 
   */
  private async saveMatchingScore(scoreData: any): Promise<void> {
    try {
      await MatchingScoreModel.create(scoreData);
    } catch (error) {
      // Don't throw error - matching should continue even if saving fails
      console.error('Failed to save matching score:', error);
    }
  }

  /**
   * Get matching analytics for a professional
   * @param professionalId 
   * @returns Analytics data
   */
  async getProfessionalAnalytics(professionalId: string) {
    try {
      const scores = await MatchingScoreModel.find({ professionalId })
        .sort({ createdAt: -1 })
        .limit(50);

      if (scores.length === 0) {
        return {
          totalMatches: 0,
          averageScore: 0,
          topFactors: [],
        };
      }

      const averageScore = scores.reduce((sum: number, score: IMatchingScore) => sum + score.overallScore, 0) / scores.length;

      // Analyze which factors contribute most to high scores
      const topFactors = [
        { name: 'Location', avgScore: 0 },
        { name: 'Rating', avgScore: 0 },
        { name: 'Expertise', avgScore: 0 },
        { name: 'Availability', avgScore: 0 },
        { name: 'Price', avgScore: 0 },
      ];

      scores.forEach(score => {
        if (topFactors[0]) topFactors[0].avgScore += score.locationScore || 0;
        if (topFactors[1]) topFactors[1].avgScore += score.ratingScore || 0;
        if (topFactors[2]) topFactors[2].avgScore += score.expertiseScore || 0;
        if (topFactors[3]) topFactors[3].avgScore += score.availabilityScore || 0;
        if (topFactors[4]) topFactors[4].avgScore += score.priceScore || 0;
      });

      topFactors.forEach(factor => {
        factor.avgScore = Math.round(factor.avgScore / scores.length);
      });

      topFactors.sort((a, b) => b.avgScore - a.avgScore);

      return {
        totalMatches: scores.length,
        averageScore: Math.round(averageScore),
        topFactors,
      };
    } catch (error) {
      throw new Error('Failed to get professional analytics');
    }
  }
}

export const aiMatchingService = new AIMatchingService();
