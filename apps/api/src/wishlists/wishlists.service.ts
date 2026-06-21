import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist) private readonly repo: Repository<Wishlist>,
  ) {}

  async list(userId: string) {
    return this.repo.find({
      where: { userId },
      relations: { product: { images: true, variants: true } },
      order: { createdAt: 'DESC' },
    });
  }

  async add(userId: string, productId: string) {
    const existing = await this.repo.findOne({ where: { userId, productId } });
    if (existing) throw new ConflictException('Product already in wishlist');
    const entry = this.repo.create({ userId, productId });
    return this.repo.save(entry);
  }

  async remove(userId: string, productId: string) {
    const entry = await this.repo.findOne({ where: { userId, productId } });
    if (!entry) throw new NotFoundException('Not in wishlist');
    await this.repo.remove(entry);
  }

  async getProductIds(userId: string): Promise<string[]> {
    const entries = await this.repo.find({ where: { userId }, select: { productId: true } });
    return entries.map((e) => e.productId);
  }
}
