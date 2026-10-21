import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

/// Design Tokens System cho dự án Flutter (Luminovels)
/// Tuân thủ chuẩn tài liệu "Design Tokens — Flutter Project.md"

class AppSpacing {
  AppSpacing._();

  // Thước 8 (8pt grid)
  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 16.0;
  static const double lg = 24.0;
  static const double xl = 32.0;
  static const double xl2 = 40.0;
  static const double xl3 = 48.0;
  static const double xl4 = 64.0;

  // EdgeInsets Shorthands
  static const EdgeInsets zero = EdgeInsets.zero;
  static const EdgeInsets paddingXs = EdgeInsets.all(xs);
  static const EdgeInsets paddingSm = EdgeInsets.all(sm);
  static const EdgeInsets paddingMd = EdgeInsets.all(md);
  static const EdgeInsets paddingLg = EdgeInsets.all(lg);
  static const EdgeInsets paddingXl = EdgeInsets.all(xl);

  static const EdgeInsets horizontalXs = EdgeInsets.symmetric(horizontal: xs);
  static const EdgeInsets horizontalSm = EdgeInsets.symmetric(horizontal: sm);
  static const EdgeInsets horizontalMd = EdgeInsets.symmetric(horizontal: md);
  static const EdgeInsets horizontalLg = EdgeInsets.symmetric(horizontal: lg);

  static const EdgeInsets verticalXs = EdgeInsets.symmetric(vertical: xs);
  static const EdgeInsets verticalSm = EdgeInsets.symmetric(vertical: sm);
  static const EdgeInsets verticalMd = EdgeInsets.symmetric(vertical: md);
  static const EdgeInsets verticalLg = EdgeInsets.symmetric(vertical: lg);

  static const EdgeInsets screenPadding = EdgeInsets.symmetric(horizontal: md, vertical: sm);
}

class AppRadius {
  AppRadius._();

  static const double sm = 4.0;
  static const double md = 8.0;
  static const double lg = 12.0;
  static const double xl = 16.0;
  static const double full = 24.0;
  static const double circular = 999.0;

  // BorderRadius Shorthands
  static final BorderRadius roundedSm = BorderRadius.circular(sm);
  static final BorderRadius roundedMd = BorderRadius.circular(md);
  static final BorderRadius roundedLg = BorderRadius.circular(lg);
  static final BorderRadius roundedXl = BorderRadius.circular(xl);
  static final BorderRadius roundedFull = BorderRadius.circular(full);
  static final BorderRadius roundedCircular = BorderRadius.circular(circular);

  // Top/Bottom rounded for sheets & dialogs
  static final BorderRadius topSheet = BorderRadius.only(
    topLeft: Radius.circular(xl),
    topRight: Radius.circular(xl),
  );
}

class AppElevation {
  AppElevation._();

  static const double none = 0.0;
  static const double card = 1.0;
  static const double appBar = 2.0;
  static const double sheet = 3.0;
  static const double dialog = 4.0;

  static final List<BoxShadow> shadowCard = [
    BoxShadow(
      color: AppColors.textDark.withValues(alpha: 0.06),
      blurRadius: 8.0,
      offset: const Offset(0, 2),
    ),
  ];

  static final List<BoxShadow> shadowElevated = [
    BoxShadow(
      color: AppColors.textDark.withValues(alpha: 0.10),
      blurRadius: 12.0,
      offset: const Offset(0, 4),
    ),
  ];
}

class AppIconSize {
  AppIconSize._();

  static const double xs = 16.0;
  static const double sm = 20.0;
  static const double md = 24.0;
  static const double lg = 32.0;
  static const double xl = 48.0;
}

class AppDurations {
  AppDurations._();

  static const Duration fast = Duration(milliseconds: 150);
  static const Duration base = Duration(milliseconds: 250);
  static const Duration slow = Duration(milliseconds: 350);
}

class AppCurves {
  AppCurves._();

  static const Curve standard = Cubic(0.2, 0.0, 0.2, 1.0);
}

class AppBreakpoints {
  AppBreakpoints._();

  static const double compact = 360.0;
  static const double medium = 600.0;
  static const double expanded = 840.0;
  static const double large = 1024.0;
}

class AppTypography {
  AppTypography._();

  static const String fontHeading = 'Times New Roman';
  static const String fontBody = 'Arial';

  // Headings (Times New Roman)
  static const TextStyle display = TextStyle(
    fontFamily: fontHeading,
    fontSize: 34.0,
    height: 1.2,
    fontWeight: FontWeight.w700,
    color: AppColors.textDark,
  );

  static const TextStyle h1 = TextStyle(
    fontFamily: fontHeading,
    fontSize: 26.0,
    height: 1.25,
    fontWeight: FontWeight.w700,
    color: AppColors.textDark,
  );

  static const TextStyle h2 = TextStyle(
    fontFamily: fontHeading,
    fontSize: 20.0,
    height: 1.3,
    fontWeight: FontWeight.w600,
    color: AppColors.textDark,
  );

  static const TextStyle h3 = TextStyle(
    fontFamily: fontHeading,
    fontSize: 17.0,
    height: 1.35,
    fontWeight: FontWeight.w600,
    color: AppColors.textDark,
  );

  // Body & Content (Arial)
  static const TextStyle bodyL = TextStyle(
    fontFamily: fontBody,
    fontSize: 16.0,
    height: 1.5,
    fontWeight: FontWeight.w400,
    color: AppColors.textDark,
  );

  static const TextStyle bodyM = TextStyle(
    fontFamily: fontBody,
    fontSize: 14.0,
    height: 1.5,
    fontWeight: FontWeight.w400,
    color: AppColors.textDark,
  );

  static const TextStyle bodyS = TextStyle(
    fontFamily: fontBody,
    fontSize: 13.0,
    height: 1.4,
    fontWeight: FontWeight.w400,
    color: AppColors.textSecondary,
  );

  static const TextStyle button = TextStyle(
    fontFamily: fontBody,
    fontSize: 14.0,
    letterSpacing: 0.3,
    fontWeight: FontWeight.w700,
    color: AppColors.surface,
  );

  static const TextStyle caption = TextStyle(
    fontFamily: fontBody,
    fontSize: 12.0,
    height: 1.4,
    fontWeight: FontWeight.w400,
    color: AppColors.textSecondary,
  );

  static const TextStyle overline = TextStyle(
    fontFamily: fontBody,
    fontSize: 11.0,
    letterSpacing: 1.0,
    fontWeight: FontWeight.w600,
    color: AppColors.textSecondary,
  );
}
