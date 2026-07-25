import { ServiceModel, type IService, type ServiceCategory } from "../models/service.model.js";

export interface ServiceQuery {
  category?: ServiceCategory | undefined;
  search?: string | undefined;
  page?: number | undefined;
  limit?: number | undefined;
}

export interface IServiceRepository {
  findAll(query: ServiceQuery): Promise<{ data: IService[]; total: number }>;
  findById(id: string): Promise<IService | null>;
  findBySlug(slug: string): Promise<IService | null>;
  create(payload: Partial<IService>): Promise<IService>;
  update(id: string, payload: Partial<IService>): Promise<IService | null>;
  remove(id: string): Promise<boolean>;
}

export class ServiceMongoRepository implements IServiceRepository {
  async findAll({ category, search, page = 1, limit = 12 }: ServiceQuery): Promise<{ data: IService[]; total: number }> {
    const filter: Record<string, any> = { isActive: true };

    if (category) filter.category = category;

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { title: regex },
        { shortDescription: regex },
        { tags: regex },
      ];
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      ServiceModel.find(filter).skip(skip).limit(limit).sort({ rating: -1, createdAt: -1 }),
      ServiceModel.countDocuments(filter),
    ]);

    return { data, total };
  }

  async findById(id: string): Promise<IService | null> {
    return ServiceModel.findById(id).populate("professionalId", "firstName lastName email phoneNumber profilePicture averageRating reviewCount status city address");
  }

  async findBySlug(slug: string): Promise<IService | null> {
    return ServiceModel.findOne({ slug, isActive: true }).populate("professionalId", "firstName lastName email phoneNumber profilePicture averageRating reviewCount status city address");
  }

  async create(payload: Partial<IService>): Promise<IService> {
    return ServiceModel.create(payload);
  }

  async update(id: string, payload: Partial<IService>): Promise<IService | null> {
    return ServiceModel.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  }

  async remove(id: string): Promise<boolean> {
    const result = await ServiceModel.findByIdAndDelete(id);
    return !!result;
  }
}
