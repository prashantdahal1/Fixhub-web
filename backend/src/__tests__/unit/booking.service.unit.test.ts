import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { BookingService } from '../../modules/booking/booking.service.js';
import { BookingModel } from '../../models/booking.model.js';
import { ServiceModel } from '../../models/service.model.js';
import { HttpException } from '../../shared/exceptions/http-exception.js';

jest.mock('../../shared/utils/realtime.util.js', () => ({
  broadcastRealtimeEvent: jest.fn(),
}));

jest.mock('../../shared/utils/notification.util.js', () => ({
  createNotification: jest.fn(),
}));

describe('BookingService Unit Tests', () => {
  let bookingService: BookingService;

  const mockCustomer = { _id: 'cust_1', role: 'customer' } as any;
  const mockProfessional = { _id: 'pro_1', role: 'professional' } as any;
  const mockAdmin = { _id: 'admin_1', role: 'admin' } as any;

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    bookingService = new BookingService();
  });

  describe('createBooking()', () => {
    it('should throw 403 if user is a professional trying to create a booking', async () => {
      await expect(
        bookingService.createBooking(mockProfessional, {
          serviceId: 'svc_1',
          scheduledAt: new Date(Date.now() + 3600000).toISOString(),
          address: 'Kathmandu',
        })
      ).rejects.toThrow(HttpException);
    });

    it('should throw 404 if the service does not exist', async () => {
      jest.spyOn(ServiceModel, 'findById').mockResolvedValueOnce(null as any);

      await expect(
        bookingService.createBooking(mockCustomer, {
          serviceId: 'svc_nonexistent',
          scheduledAt: new Date(Date.now() + 3600000).toISOString(),
          address: 'Kathmandu',
        })
      ).rejects.toThrow(HttpException);
    });

    it('should throw 404 if the service is inactive', async () => {
      jest.spyOn(ServiceModel, 'findById').mockResolvedValueOnce({ isActive: false } as any);

      await expect(
        bookingService.createBooking(mockCustomer, {
          serviceId: 'svc_1',
          scheduledAt: new Date(Date.now() + 3600000).toISOString(),
          address: 'Kathmandu',
        })
      ).rejects.toThrow(HttpException);
    });

    it('should throw 400 if scheduledAt is in the past', async () => {
      jest.spyOn(ServiceModel, 'findById').mockResolvedValueOnce({ isActive: true, basePrice: 500 } as any);

      await expect(
        bookingService.createBooking(mockCustomer, {
          serviceId: 'svc_1',
          scheduledAt: new Date('2020-01-01').toISOString(),
          address: 'Kathmandu',
        })
      ).rejects.toThrow(HttpException);
    });

    it('should successfully create a booking with confirmed status', async () => {
      const mockService = { _id: 'svc_1', isActive: true, basePrice: 1000, professionalId: 'pro_1' };
      const mockBooking = { _id: 'bkg_1', status: 'confirmed', amount: 1000 };
      jest.spyOn(ServiceModel, 'findById').mockResolvedValueOnce(mockService as any);
      jest.spyOn(BookingModel, 'create').mockResolvedValueOnce(mockBooking as any);

      const result = await bookingService.createBooking(mockCustomer, {
        serviceId: 'svc_1',
        scheduledAt: new Date(Date.now() + 3600000).toISOString(),
        address: 'Kathmandu',
      });

      expect(result.status).toBe('confirmed');
      expect(result.amount).toBe(1000);
    });
  });

  describe('getMyBookings()', () => {
    it('should fetch bookings filtered by customerId for customer role', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValueOnce([{ _id: 'bkg_1', customerId: 'cust_1' }]),
      };
      jest.spyOn(BookingModel, 'find').mockReturnValueOnce(mockQuery as any);

      const result = await bookingService.getMyBookings(mockCustomer);
      expect(BookingModel.find).toHaveBeenCalledWith({ customerId: 'cust_1' });
      expect(result).toHaveLength(1);
    });

    it('should fetch all bookings when user is admin', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValueOnce([{ _id: 'bkg_1' }, { _id: 'bkg_2' }]),
      };
      jest.spyOn(BookingModel, 'find').mockReturnValueOnce(mockQuery as any);

      const result = await bookingService.getMyBookings(mockAdmin);
      expect(BookingModel.find).toHaveBeenCalledWith({});
      expect(result).toHaveLength(2);
    });

    it('should fetch bookings filtered by professionalId for professional role', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValueOnce([{ _id: 'bkg_1', professionalId: 'pro_1' }]),
      };
      jest.spyOn(BookingModel, 'find').mockReturnValueOnce(mockQuery as any);

      const result = await bookingService.getMyBookings(mockProfessional);
      expect(BookingModel.find).toHaveBeenCalledWith({ professionalId: 'pro_1' });
    });
  });
});
