import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'app_colors.dart';

/// 8-point Grid Spacing Scale
class AppSpacing {
  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 16.0;
  static const double lg = 24.0;
  static const double xl = 32.0;
  static const double xl2 = 40.0;
  static const double xl3 = 48.0;
  static const double xl4 = 64.0;
}

/// Border Radius Tokens
class AppRadius {
  static const double sm = 4.0;
  static const double md = 8.0; // Cards, cover images
  static const double lg = 12.0; // Large cards, search inputs
  static const double xl = 16.0; // Bottom sheets, modals
  static const double full = 24.0; // Chips, pill buttons

  static BorderRadius get radiusSm => BorderRadius.circular(sm);
  static BorderRadius get radiusMd => BorderRadius.circular(md);
  static BorderRadius get radiusLg => BorderRadius.circular(lg);
  static BorderRadius get radiusXl => BorderRadius.circular(xl);
  static BorderRadius get radiusFull => BorderRadius.circular(full);
}

/// Icon Sizes
class AppIconSizes {
  static const double sm = 16.0;
  static const double md = 20.0;
  static const double lg = 24.0;
  static const double xl = 32.0;
}

/// Elevation Tokens
class AppElevation {
  static const double level0 = 0.0;
  static const double level1 = 1.0; // Card
  static const double level2 = 2.0; // AppBar
  static const double level3 = 3.0; // Sheet
  static const double level4 = 4.0; // Dialog

  /// Subtle soft shadow for cards (level 1)
  static List<BoxShadow> get cardShadow => [
    BoxShadow(
      color: const Color(0xFF282932).withValues(alpha: 0.06),
      blurRadius: 6,
      offset: const Offset(0, 2),
    ),
  ];

  /// Elevated shadow for sheets & modals
  static List<BoxShadow> get sheetShadow => [
    BoxShadow(
      color: const Color(0xFF282932).withValues(alpha: 0.12),
      blurRadius: 16,
      offset: const Offset(0, -4),
    ),
  ];
}

/// Motion & Animation Tokens
class AppMotion {
  static const Duration fast = Duration(milliseconds: 150);
  static const Duration base = Duration(milliseconds: 250);
  static const Duration slow = Duration(milliseconds: 350);

  static const Curve standardCurve = Cubic(0.2, 0.0, 0.2, 1.0);
}

/// Design Token Typography
/// Uses Tinos (Times New Roman equivalent) for Headings
/// and Arimo (Arial equivalent) for Body & Sans Text
class AppTypography {
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

  static TextStyle button = GoogleFonts.arimo(
    fontSize: 14,
    fontWeight: FontWeight.w700,
    letterSpacing: 0.3,
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
