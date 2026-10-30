import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'app_colors.dart';

/// 8-point Grid Spacing Scale & EdgeInsets Shorthands
class AppSpacing {
  AppSpacing._();

  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 16.0;
  static const double lg = 24.0;
  static const double xl = 32.0;
  static const double xl2 = 40.0;
  static const double xl3 = 48.0;
  static const double xl4 = 64.0;

  // EdgeInsets Shorthands (Dev2 compatibility)
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

  static const EdgeInsets screenPadding =
      EdgeInsets.symmetric(horizontal: md, vertical: sm);
}

/// Border Radius Tokens & Shorthands
class AppRadius {
  AppRadius._();

  static const double sm = 4.0;
  static const double md = 8.0; // Cards, cover images
  static const double lg = 12.0; // Large cards, search inputs
  static const double xl = 16.0; // Bottom sheets, modals
  static const double full = 24.0; // Chips, pill buttons
  static const double circular = 999.0;

  // Dev1 Getters
  static BorderRadius get radiusSm => BorderRadius.circular(sm);
  static BorderRadius get radiusMd => BorderRadius.circular(md);
  static BorderRadius get radiusLg => BorderRadius.circular(lg);
  static BorderRadius get radiusXl => BorderRadius.circular(xl);
  static BorderRadius get radiusFull => BorderRadius.circular(full);

  // Dev2 Shorthands
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

/// Icon Sizes (Dev2 style)
class AppIconSize {
  AppIconSize._();

  static const double xs = 16.0;
  static const double sm = 20.0;
  static const double md = 24.0;
  static const double lg = 32.0;
  static const double xl = 48.0;
}

/// Icon Sizes (Dev1 style)
class AppIconSizes {
  AppIconSizes._();

  static const double xs = 16.0;
  static const double sm = 16.0;
  static const double md = 20.0;
  static const double lg = 24.0;
  static const double xl = 32.0;
  static const double xxl = 48.0;
}

/// Elevation Tokens
class AppElevation {
  AppElevation._();

  // Dev1 Levels
  static const double level0 = 0.0;
  static const double level1 = 1.0; // Card
  static const double level2 = 2.0; // AppBar
  static const double level3 = 3.0; // Sheet
  static const double level4 = 4.0; // Dialog

  // Dev2 Named Values
  static const double none = 0.0;
  static const double card = 1.0;
  static const double appBar = 2.0;
  static const double sheet = 3.0;
  static const double dialog = 4.0;

  /// Dev1 Subtle soft shadow for cards (level 1)
  static List<BoxShadow> get cardShadow => [
        BoxShadow(
          color: const Color(0xFF282932).withValues(alpha: 0.06),
          blurRadius: 6,
          offset: const Offset(0, 2),
        ),
      ];

  /// Dev1 Elevated shadow for sheets & modals
  static List<BoxShadow> get sheetShadow => [
        BoxShadow(
          color: const Color(0xFF282932).withValues(alpha: 0.12),
          blurRadius: 16,
          offset: const Offset(0, -4),
        ),
      ];

  /// Dev2 Shadow for cards
  static final List<BoxShadow> shadowCard = [
    BoxShadow(
      color: AppColors.textDark.withValues(alpha: 0.06),
      blurRadius: 8.0,
      offset: const Offset(0, 2),
    ),
  ];

  /// Dev2 Elevated shadow
  static final List<BoxShadow> shadowElevated = [
    BoxShadow(
      color: AppColors.textDark.withValues(alpha: 0.10),
      blurRadius: 12.0,
      offset: const Offset(0, 4),
    ),
  ];
}

/// Motion Tokens (Dev1)
class AppMotion {
  AppMotion._();

  static const Duration fast = Duration(milliseconds: 150);
  static const Duration base = Duration(milliseconds: 250);
  static const Duration slow = Duration(milliseconds: 350);

  static const Curve standardCurve = Cubic(0.2, 0.0, 0.2, 1.0);
}

/// Durations (Dev2)
class AppDurations {
  AppDurations._();

  static const Duration fast = Duration(milliseconds: 150);
  static const Duration base = Duration(milliseconds: 250);
  static const Duration slow = Duration(milliseconds: 350);
}

/// Curves (Dev2)
class AppCurves {
  AppCurves._();

  static const Curve standard = Cubic(0.2, 0.0, 0.2, 1.0);
}

/// Breakpoints (Dev2)
class AppBreakpoints {
  AppBreakpoints._();

  static const double compact = 360.0;
  static const double medium = 600.0;
  static const double expanded = 840.0;
  static const double large = 1024.0;
}

/// Design Token Typography
/// Uses Tinos (Times New Roman equivalent) for Headings
/// and Arimo (Arial equivalent) for Body & Sans Text
class AppTypography {
  AppTypography._();

  static const String fontHeading = 'Times New Roman';
  static const String fontBody = 'Arial';

  // --- Headings (Serif - Tinos) ---
  static TextStyle display = GoogleFonts.tinos(
    fontSize: 34,
    fontWeight: FontWeight.w700,
    height: 1.2,
    color: AppColors.textPrimary,
  );

  static TextStyle h1 = GoogleFonts.tinos(
    fontSize: 26,
    fontWeight: FontWeight.w700,
    height: 1.25,
    color: AppColors.textPrimary,
  );

  static TextStyle h2 = GoogleFonts.tinos(
    fontSize: 20,
    fontWeight: FontWeight.w600,
    height: 1.3,
    color: AppColors.textPrimary,
  );

  static TextStyle h3 = GoogleFonts.tinos(
    fontSize: 17,
    fontWeight: FontWeight.w600,
    height: 1.35,
    color: AppColors.textPrimary,
  );

  // --- Body & Functional (Sans - Arimo) ---
  static TextStyle bodyL = GoogleFonts.arimo(
    fontSize: 16,
    fontWeight: FontWeight.w400,
    height: 1.5,
    color: AppColors.textPrimary,
  );

  static TextStyle bodyM = GoogleFonts.arimo(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    height: 1.5,
    color: AppColors.textPrimary,
  );

  static TextStyle bodyS = GoogleFonts.arimo(
    fontSize: 13,
    fontWeight: FontWeight.w400,
    height: 1.4,
    color: AppColors.textSecondary,
  );

  static TextStyle button = GoogleFonts.arimo(
    fontSize: 14,
    fontWeight: FontWeight.w700,
    letterSpacing: 0.3,
    color: AppColors.surface,
  );

  static TextStyle caption = GoogleFonts.arimo(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    height: 1.4,
    color: AppColors.textSecondary,
  );

  static TextStyle overline = GoogleFonts.arimo(
    fontSize: 11,
    fontWeight: FontWeight.w600,
    letterSpacing: 1.0,
    color: AppColors.textSecondary,
  );
}
