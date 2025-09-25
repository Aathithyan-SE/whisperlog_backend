import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserFormat, UserFormatDocument } from '../schemas/user-format.schema';
import { CreateUserFormatDto } from './dto/create-user-format.dto';
import { UpdateUserFormatDto } from './dto/update-user-format.dto';
import { QueryUserFormatsDto } from './dto/query-user-formats.dto';

@Injectable()
export class UserFormatsService {
  constructor(
    @InjectModel(UserFormat.name) private userFormatModel: Model<UserFormatDocument>,
  ) {}

  async create(userId: string, createUserFormatDto: CreateUserFormatDto) {
    const userFormat = new this.userFormatModel({
      ...createUserFormatDto,
      userId: new Types.ObjectId(userId),
    });

    await userFormat.save();
    return userFormat.populate('userId', 'username email');
  }

  async findAll(userId: string, queryDto: QueryUserFormatsDto) {
    const { page, limit, search, sortBy, sortOrder } = queryDto;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {
      userId: new Types.ObjectId(userId),
      isActive: true,
    };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute queries
    const [formats, total] = await Promise.all([
      this.userFormatModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('userId', 'username email')
        .exec(),
      this.userFormatModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: formats,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findOne(userId: string, id: string) {
    const userFormat = await this.userFormatModel
      .findOne({
        _id: new Types.ObjectId(id),
        userId: new Types.ObjectId(userId),
        isActive: true,
      })
      .populate('userId', 'username email')
      .exec();

    if (!userFormat) {
      throw new NotFoundException('User format not found');
    }

    return userFormat;
  }

  async update(userId: string, id: string, updateUserFormatDto: UpdateUserFormatDto) {
    const userFormat = await this.userFormatModel
      .findOne({
        _id: new Types.ObjectId(id),
        userId: new Types.ObjectId(userId),
        isActive: true,
      })
      .exec();

    if (!userFormat) {
      throw new NotFoundException('User format not found');
    }

    Object.assign(userFormat, updateUserFormatDto);
    await userFormat.save();

    return userFormat.populate('userId', 'username email');
  }

  async remove(userId: string, id: string) {
    const userFormat = await this.userFormatModel
      .findOne({
        _id: new Types.ObjectId(id),
        userId: new Types.ObjectId(userId),
        isActive: true,
      })
      .exec();

    if (!userFormat) {
      throw new NotFoundException('User format not found');
    }

    userFormat.isActive = false;
    await userFormat.save();

    return { message: 'User format deleted successfully' };
  }

  async findByIdForProcessing(formatId: string, userId: string): Promise<UserFormatDocument> {
    const userFormat = await this.userFormatModel
      .findOne({
        _id: new Types.ObjectId(formatId),
        userId: new Types.ObjectId(userId),
        isActive: true,
      })
      .exec();

    if (!userFormat) {
      throw new NotFoundException('User format not found');
    }

    return userFormat;
  }
}
