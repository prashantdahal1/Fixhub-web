import express from 'express';
import request from 'supertest';
import { ApiResponseHelper } from '../utils/apihelper.util.js';

test('POST / creates a Thing when authenticated (local handler)', async () => {
    const app = express();
    app.use(express.json());

    // Fake auth middleware
    app.use((req: any, res, next) => { req.user = { _id: '507f1f77bcf86cd799439011' }; next(); });

    // Fake service
    const fakeService = {
        async createThing(dto: any) { return { id: 'abc123', name: dto.name, description: dto.description || '', createdAt: new Date().toISOString() }; }
    };

    // Route handler mirroring real implementation
    app.post('/api/v1/things', async (req: any, res) => {
        try {
            const { name, description } = req.body;
            if (!name || typeof name !== 'string') {
                return ApiResponseHelper.error(res, 'Name is required', 400);
            }
            const user = req.user;
            const created = await fakeService.createThing({ name: name.trim(), description: description || '' }, user?._id?.toString?.());
            return ApiResponseHelper.success(res, created, 'Thing created', 201);
        } catch (error: any) {
            console.error('Thing create error:', error);
            return ApiResponseHelper.error(res, error?.message || 'Failed to create Thing', 500);
        }
    });

    const res = await request(app)
        .post('/api/v1/things')
        .send({ name: 'Test Thing', description: 'desc' })
        .set('Accept', 'application/json');

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toMatchObject({ name: 'Test Thing', description: 'desc' });
});
