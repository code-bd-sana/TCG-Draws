import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid current password');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(changePasswordDto.newPassword, salt);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { message: 'Password updated successfully' };
  }

  saveBase64Image(dataUri: string): string {
    try {
      const matches = dataUri.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return dataUri;
      }
      const mimeType = matches[1];
      const buffer = Buffer.from(matches[2], 'base64');
      let ext = '.png';
      if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = '.jpg';
      else if (mimeType.includes('webp')) ext = '.webp';
      else if (mimeType.includes('gif')) ext = '.gif';
      else if (mimeType.includes('svg')) ext = '.svg';

      const randomName = Array(32)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
      const filename = `${randomName}${ext}`;
      const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      fs.writeFileSync(path.join(uploadDir, filename), buffer);

      const baseUrl = process.env.APP_URL || 'http://localhost:5000';
      return `${baseUrl}/uploads/avatars/${filename}`;
    } catch (e) {
      console.error('Failed to save base64 avatar', e);
      return dataUri;
    }
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { hostProfile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { businessName, bio, avatarUrl, ...userData } = updateProfileDto;

    if (userData.dateOfBirth) {
      const dob = new Date(userData.dateOfBirth);
      if (isNaN(dob.getTime())) {
        throw new BadRequestException('Invalid date of birth format');
      }
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      if (age < 18) {
        throw new BadRequestException('You must be at least 18 years of age. Profile update refused.');
      }
      (userData as any).dateOfBirth = dob;
    }

    let finalAvatarUrl = avatarUrl;
    if (finalAvatarUrl && finalAvatarUrl.startsWith('data:image')) {
      finalAvatarUrl = this.saveBase64Image(finalAvatarUrl);
    }

    const updatedUser = await this.prisma.$transaction(async (prisma) => {
      const userUpdateData: any = { ...userData };
      if (finalAvatarUrl !== undefined) {
        userUpdateData.avatarUrl = finalAvatarUrl;
      }

      const u = await prisma.user.update({
        where: { id: userId },
        data: userUpdateData,
        include: { hostProfile: true },
      });

      if (u.role === 'HOST') {
        const hostProfileData: any = {};
        if (businessName !== undefined)
          hostProfileData.businessName = businessName;
        if (bio !== undefined) hostProfileData.bio = bio;
        if (userData.phone !== undefined)
          hostProfileData.phone = userData.phone;
        if (userData.address !== undefined)
          hostProfileData.address = userData.address;

        // Ensure host has a valid URL-safe slug
        if (businessName || !u.hostProfile?.slug) {
          const rawName = businessName || u.hostProfile?.businessName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'host';
          let baseSlug = rawName
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
          if (!baseSlug) baseSlug = 'host';

          let slug = baseSlug;
          let counter = 1;
          while (true) {
            const existing = await prisma.hostProfile.findUnique({ where: { slug } });
            if (!existing || existing.userId === userId) break;
            slug = `${baseSlug}-${counter}`;
            counter++;
          }
          hostProfileData.slug = slug;
        }

        if (Object.keys(hostProfileData).length > 0) {
          if (u.hostProfile) {
            await prisma.hostProfile.update({
              where: { userId },
              data: hostProfileData,
            });
          } else {
            await prisma.hostProfile.create({
              data: {
                userId,
                businessName: businessName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Host Brand',
                ...hostProfileData,
              },
            });
          }
        }
      }
      return prisma.user.findUnique({
        where: { id: userId },
        include: { hostProfile: true },
      });
    });

    const { passwordHash, ...userWithoutPassword } = updatedUser!;
    return {
      message: 'Profile updated successfully',
      user: userWithoutPassword,
    };
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });

    const { passwordHash, ...userWithoutPassword } = updatedUser;
    return {
      message: 'Avatar updated successfully',
      user: userWithoutPassword,
    };
  }

  async getMyWinners(userId: string) {
    const winners = await this.prisma.winner.findMany({
      where: { userId },
      include: {
        raffle: {
          include: {
            host: true,
            instantWins: true,
          },
        },
        ticket: {
          select: {
            ticketNumber: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return winners.map((w) => {
      const instantWinDetails =
        w.winType === 'INSTANT_WIN'
          ? w.raffle.instantWins.find(
              (iw) => iw.ticketNumber === w.ticket.ticketNumber,
            )
          : null;

      const prizeImage =
        w.winType === 'INSTANT_WIN'
          ? instantWinDetails?.image || w.raffle.mainImage
          : w.raffle.mainImage;

      const prizeName =
        w.prizeName ||
        (w.winType === 'INSTANT_WIN'
          ? instantWinDetails?.prizeName
          : w.raffle.prizeName);

      return {
        id: w.id,
        raffleId: w.raffleId,
        ticketId: w.ticketId,
        winType: w.winType, // 'INSTANT_WIN' | 'MAIN_DRAW'
        prizeName: prizeName || 'Prize',
        prizeImage: prizeImage || null,
        rrpValue: instantWinDetails?.rrpValue
          ? Number(instantWinDetails.rrpValue)
          : w.raffle.mainPrizeValue
            ? Number(w.raffle.mainPrizeValue)
            : null,
        ticketNumber: w.ticket.ticketNumber,
        deliveryStatus: w.deliveryStatus,
        verificationStatus: w.verificationStatus,
        trackingNumber: w.trackingNumber,
        createdAt: w.createdAt,
        raffle: {
          id: w.raffle.id,
          title: w.raffle.title,
          slug: w.raffle.slug,
          mainImage: w.raffle.mainImage,
          hostBusinessName: w.raffle.host?.businessName || 'Host',
          status: w.raffle.status,
        },
        instantWinDetails: instantWinDetails
          ? {
              id: instantWinDetails.id,
              prizeName: instantWinDetails.prizeName,
              image: instantWinDetails.image,
              rrpValue: instantWinDetails.rrpValue
                ? Number(instantWinDetails.rrpValue)
                : null,
            }
          : null,
      };
    });
  }

  async getUnclaimedInstantWins(userId: string) {
    const winners = await this.prisma.winner.findMany({
      where: {
        userId,
        winType: 'INSTANT_WIN',
        isClaimed: false,
      },
      include: {
        raffle: {
          include: {
            host: true,
            instantWins: true,
          },
        },
        ticket: {
          select: {
            ticketNumber: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return winners.map((w) => {
      const instantWinDetails = w.raffle.instantWins.find(
        (iw) => iw.ticketNumber === w.ticket?.ticketNumber,
      );

      const prizeImage = instantWinDetails?.image || w.raffle.mainImage;
      const prizeName =
        w.prizeName || instantWinDetails?.prizeName || 'Instant Win Prize';

      return {
        id: w.id,
        raffleId: w.raffleId,
        ticketId: w.ticketId,
        winType: w.winType,
        prizeName,
        title: prizeName, // for frontend compatibility
        prizeImage: prizeImage || null,
        rrpValue: instantWinDetails?.rrpValue
          ? Number(instantWinDetails.rrpValue)
          : null,
        ticketNumber: w.ticket?.ticketNumber || 0,
        isClaimed: w.isClaimed,
        createdAt: w.createdAt,
        raffle: {
          id: w.raffle.id,
          title: w.raffle.title,
          slug: w.raffle.slug,
          mainImage: w.raffle.mainImage,
        },
      };
    });
  }

  async claimInstantWins(userId: string, winnerIds?: string[]) {
    const whereClause: any = {
      userId,
      winType: 'INSTANT_WIN',
      isClaimed: false,
    };

    if (winnerIds && Array.isArray(winnerIds) && winnerIds.length > 0) {
      whereClause.id = { in: winnerIds };
    }

    const updated = await this.prisma.winner.updateMany({
      where: whereClause,
      data: {
        isClaimed: true,
      },
    });

    return {
      success: true,
      claimedCount: updated.count,
      message: 'Instant win prize(s) claimed successfully',
    };
  }
}

