import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // 1. Core Palette (Tông chuẩn từ Design Tokens)
  // Background: Màu nền vàng ấm vintage
  static const Color background = Color(0xFFDDDBBB);

  // Surface: Nền card, dialog, sheet tách biệt khỏi background
  static const Color surface = Color(0xFFFFFDF2);

  // Primary / Accent: Nâu đỏ đất / Terra Cotta
  static const Color primary = Color(0xFF884730);

  // Text / Dark: Chữ chính tương phản cao trên nền giấy vàng
  static const Color textDark = Color(0xFF282932);

  // 2. Semantic & Trạng thái
  static const Color success = Color(0xFF4C7A4C);
  static const Color warning = Color(0xFFB4791F);
  static const Color error = Color(0xFFA53F3F);
  static const Color info = Color(0xFF3F6FA5);
  static const Color disabled = Color(0xFF9C998A);
  static const Color divider = Color(0x24282932); // rgba(40,41,50,0.14)

  // 3. Text Shades & Neutrals
  static const Color textPrimary = textDark;
  static const Color textSecondary = Color(0xFF6B6A60); // Neutral ấm
  static const Color textMuted = Color(0xFF9C998A);

  // 4. Accent variations
  static const Color primaryLight = Color(0xFFA2593E);
  static const Color primaryDark = Color(0xFF6B3624);
  static const Color secondary = Color(0xFF884730);
  static const Color accent = Color(0xFF884730);

  // 5. Reader Modes
  static const Color paperBg = Color(0xFFDDDBBB);
  static const Color paperText = Color(0xFF282932);
  static const Color nightBg = Color(0xFF141416);
  static const Color nightCard = Color(0xFF1F2024);
  static const Color nightText = Color(0xFFE0E0E0);

  // 6. Badges & Monetization
  static const Color coinGold = Color(0xFFB4791F); // Vàng đất ấm
  static const Color vipBadge = Color(0xFF884730);
  static const Color freeBadge = Color(0xFF4C7A4C);
  static const Color completedBadge = Color(0xFF3F6FA5);
}
