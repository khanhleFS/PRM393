import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import '../../core/theme/app_tokens.dart';

/// A high-performance network image widget tailored for both Flutter Web and Mobile.
///
/// - On **Web** (`kIsWeb`): Uses native browser [Image.network] with hardware decoding,
///   streaming, and browser HTTP cache (much faster than CachedNetworkImage on web).
/// - On **Mobile**: Uses [CachedNetworkImage] with disk caching and bounded [memCacheWidth].
/// - Fallback: Gracefully handles timeouts, empty URLs, and dead domains with a clean UI.
class AppNetworkImage extends StatelessWidget {
  final String imageUrl;
  final BoxFit fit;
  final double? width;
  final double? height;
  final BorderRadius? borderRadius;
  final Widget? placeholder;
  final Widget? errorWidget;
  final int memCacheWidth;
  final int memCacheHeight;

  const AppNetworkImage({
    super.key,
    required this.imageUrl,
    this.fit = BoxFit.cover,
    this.width,
    this.height,
    this.borderRadius,
    this.placeholder,
    this.errorWidget,
    this.memCacheWidth = 350,
    this.memCacheHeight = 500,
  });

  bool get _isInvalidUrl =>
      imageUrl.isEmpty ||
      imageUrl.contains('cdn.example.com') ||
      !imageUrl.startsWith('http');

  @override
  Widget build(BuildContext context) {
    Widget content;

    if (_isInvalidUrl) {
      content = _buildDefaultPlaceholder();
    } else if (kIsWeb) {
      // Flutter Web: Native browser pipeline (much faster than XHR byte fetching)
      content = Image.network(
        imageUrl,
        width: width,
        height: height,
        fit: fit,
        cacheWidth: memCacheWidth,
        cacheHeight: memCacheHeight,
        loadingBuilder: (context, child, loadingProgress) {
          if (loadingProgress == null) return child;
          return placeholder ?? _buildLoadingPlaceholder();
        },
        errorBuilder: (context, error, stackTrace) {
          return errorWidget ?? _buildDefaultPlaceholder();
        },
      );
    } else {
      // Mobile / Desktop: Disk caching via CachedNetworkImage
      content = CachedNetworkImage(
        imageUrl: imageUrl,
        width: width,
        height: height,
        fit: fit,
        memCacheWidth: memCacheWidth,
        memCacheHeight: memCacheHeight,
        placeholder: (context, url) => placeholder ?? _buildLoadingPlaceholder(),
        errorWidget: (context, url, error) => errorWidget ?? _buildDefaultPlaceholder(),
      );
    }

    if (borderRadius != null) {
      return ClipRRect(
        borderRadius: borderRadius!,
        child: content,
      );
    }

    return content;
  }

  Widget _buildLoadingPlaceholder() {
    return Container(
      width: width,
      height: height,
      color: AppColors.background.withValues(alpha: 0.6),
      child: Center(
        child: Icon(
          Icons.image_outlined,
          size: AppIconSize.md,
          color: AppColors.disabled.withValues(alpha: 0.6),
        ),
      ),
    );
  }

  Widget _buildDefaultPlaceholder() {
    return Container(
      width: width,
      height: height,
      color: AppColors.background.withValues(alpha: 0.85),
      child: Center(
        child: Icon(
          Icons.auto_stories_outlined,
          size: AppIconSize.lg,
          color: AppColors.disabled,
        ),
      ),
    );
  }
}
