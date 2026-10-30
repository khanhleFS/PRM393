import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import '../../core/theme/app_tokens.dart';
import '../../data/models/novel_model.dart';

class NovelCard extends StatelessWidget {
  final NovelModel novel;
  final VoidCallback onTap;

  const NovelCard({
    super.key,
    required this.novel,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isCompleted = novel.status.toUpperCase() == 'COMPLETED';

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: AppRadius.roundedMd,
        child: Container(
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: AppRadius.roundedMd,
            boxShadow: AppElevation.shadowCard,
            border: Border.all(
              color: AppColors.divider,
              width: 0.8,
            ),
          ),
          clipBehavior: Clip.antiAlias,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Cover Image with Badge & Overlay
              Expanded(
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    novel.coverImageUrl.isNotEmpty
                        ? CachedNetworkImage(
                            imageUrl: novel.coverImageUrl,
                            fit: BoxFit.cover,
                            placeholder: (context, url) => Container(
                              color: AppColors.background.withValues(alpha: 0.5),
                              child: const Center(
                                child: SizedBox(
                                  width: AppIconSize.md,
                                  height: AppIconSize.md,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: AppColors.primary,
                                  ),
                                ),
                              ),
                            ),
                            errorWidget: (context, url, error) => Container(
                              color: AppColors.background.withValues(alpha: 0.7),
                              child: const Center(
                                child: Icon(
                                  Icons.auto_stories_outlined,
                                  size: AppIconSize.xl,
                                  color: AppColors.disabled,
                                ),
                              ),
                            ),
                          )
                        : Container(
                            color: AppColors.background.withValues(alpha: 0.7),
                            child: const Center(
                              child: Icon(
                                Icons.auto_stories_outlined,
                                size: AppIconSize.xl,
                                color: AppColors.disabled,
                              ),
                            ),
                          ),
                    // Gradient Overlay for Text Readability
                    Positioned(
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: AppSpacing.xl2,
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.bottomCenter,
                            end: Alignment.topCenter,
                            colors: [
                              AppColors.textDark.withValues(alpha: 0.8),
                              Colors.transparent,
                            ],
                          ),
                        ),
                      ),
                    ),
                    // Status Badge (Top-Right)
                    Positioned(
                      top: AppSpacing.xs,
                      right: AppSpacing.xs,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.xs,
                          vertical: 2.0,
                        ),
                        decoration: BoxDecoration(
                          color: isCompleted
                              ? AppColors.completedBadge
                              : AppColors.warning,
                          borderRadius: AppRadius.roundedSm,
                        ),
                        child: Text(
                          isCompleted ? 'Đã xong' : 'Đang ra',
                          style: AppTypography.overline.copyWith(
                            color: AppColors.surface,
                            fontSize: 10,
                          ),
                        ),
                      ),
                    ),
                    // Chapter count (Bottom-Left)
                    Positioned(
                      bottom: AppSpacing.xs,
                      left: AppSpacing.sm,
                      child: Row(
                        children: [
                          const Icon(
                            Icons.menu_book_rounded,
                            size: AppIconSize.xs,
                            color: AppColors.surface,
                          ),
                          const SizedBox(width: AppSpacing.xs),
                          Text(
                            '${novel.chapterCount} chương',
                            style: AppTypography.caption.copyWith(
                              color: AppColors.surface,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              // Title and author
              Padding(
                padding: AppSpacing.paddingSm,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      novel.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: AppTypography.h3.copyWith(
                        fontSize: 14.0,
                        height: 1.25,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Row(
                      children: [
                        const Icon(
                          Icons.person_outline,
                          size: AppIconSize.xs,
                          color: AppColors.textSecondary,
                        ),
                        const SizedBox(width: AppSpacing.xs),
                        Expanded(
                          child: Text(
                            novel.authorName,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: AppTypography.caption,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
