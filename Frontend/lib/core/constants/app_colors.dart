import 'package:flutter/material.dart';

/// Design Token Colors for Luminovels Flutter Project
/// Aligned with `Design Tokens — Flutter Project.md`
class AppColors {
  // --- Core Brand Tokens ---
  static const Color background = Color(0xFFDDDBBB); // Warm vintage paper
  static const Color surface = Color(0xFFFFFDF2); // Card, sheet & modal surface
  static const Color primary = Color(
    0xFF884730,
  ); // Terra cotta / warm earth red-brown
  static const Color textPrimary = Color(
    0xFF282932,
  ); // Dark text with high contrast
  static const Color textDark = Color(0xFF282932); // Alias for textPrimary

  // Subtle text tones
  static const Color textSecondary = Color(0xFF5B5B63); // Muted secondary text
  static const Color textMuted = Color(0xFF78776E); // Sub-caption muted text

  // --- Semantic & Status Tokens ---
  static const Color success = Color(0xFF4C7A4C);
  static const Color warning = Color(0xFFB4791F);
  static const Color error = Color(0xFFA53F3F);
  static const Color info = Color(0xFF3F6FA5);
  static const Color disabled = Color(0xFF9C998A);
  static const Color divider = Color(0x24282932); // rgba(40,41,50,0.14)

  // --- Reader Specific Modes ---
  // 1. Paper Mode (Ngà)
  static const Color paperBg = Color(0xFFDDDBBB);
  static const Color paperText = Color(0xFF282932);

  // 2. Night Mode (Đêm)
  static const Color nightBg = Color(0xFF141416);
  static const Color nightCard = Color(0xFF1F2024);
  static const Color nightText = Color(0xFFEFEEE4);

  // 3. Light Mode (Sáng)
  static const Color lightBg = Color(0xFFFFFDF2);
  static const Color lightText = Color(0xFF282932);

  // --- Compatibility Aliases (ensures Dev2/Dev3 screens compile safely) ---
  static const Color primaryLight = Color(0xFFA8634B);
  static const Color primaryDark = Color(0xFF663321);
  static const Color secondary = Color(0xFF3F414D);
  static const Color accent = Color(0xFF884730);

  // Status badges & coins
  static const Color coinGold = Color(0xFFB4791F);
  static const Color vipBadge = Color(0xFFB4791F);
  static const Color freeBadge = Color(0xFF4C7A4C);
  static const Color completedBadge = Color(0xFF3F6FA5);
}
