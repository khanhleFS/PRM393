import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

class LocalStorage {
  static const String keyAccessToken = 'access_token';
  static const String keyRefreshToken = 'refresh_token';
  static const String keyUserInfo = 'user_info';
  static const String keyFontSize = 'reader_font_size';
  static const String keyFontFamily =
      'reader_font_family'; // 'Literata' or 'Plus Jakarta Sans'
  static const String keyReaderTheme =
      'reader_theme'; // 'paper', 'night', 'light'

  static SharedPreferences? _prefs;

  static Future<void> init() async {
    _prefs ??= await SharedPreferences.getInstance();
  }

  static SharedPreferences get prefs {
    if (_prefs == null) {
      throw StateError(
        'LocalStorage not initialized. Call LocalStorage.init() in main()',
      );
    }
    return _prefs!;
  }

  // Tokens
  static String? getAccessToken() => prefs.getString(keyAccessToken);
  static Future<void> saveAccessToken(String token) =>
      prefs.setString(keyAccessToken, token);

  static String? getRefreshToken() => prefs.getString(keyRefreshToken);
  static Future<void> saveRefreshToken(String token) =>
      prefs.setString(keyRefreshToken, token);

  // User
  static Map<String, dynamic>? getUserInfo() {
    final str = prefs.getString(keyUserInfo);
    if (str == null) return null;
    try {
      return jsonDecode(str) as Map<String, dynamic>;
    } catch (_) {
      return null;
    }
  }

  static Future<void> saveUserInfo(Map<String, dynamic> userMap) =>
      prefs.setString(keyUserInfo, jsonEncode(userMap));

  static String? getUserEmail() {
    final user = getUserInfo();
    return user?['email'] as String?;
  }

  static int getUserCoins() {
    final user = getUserInfo();
    return (user?['coinBalance'] as num?)?.toInt() ?? 0;
  }

  static Future<void> updateUserCoins(int balance) async {
    final user = getUserInfo();
    if (user != null) {
      user['coinBalance'] = balance;
      await saveUserInfo(user);
    }
  }

  // Reader Preferences
  static double getFontSize() => prefs.getDouble(keyFontSize) ?? 18.0;
  static Future<void> saveFontSize(double size) =>
      prefs.setDouble(keyFontSize, size);

  static String getFontFamily() {
    final font = prefs.getString(keyFontFamily) ?? 'Tinos';
    if (font == 'Literata') return 'Tinos';
    if (font == 'Plus Jakarta Sans') return 'Arimo';
    return font;
  }

  static Future<void> saveFontFamily(String font) =>
      prefs.setString(keyFontFamily, font);

  static String getReaderTheme() => prefs.getString(keyReaderTheme) ?? 'paper';
  static Future<void> saveReaderTheme(String theme) =>
      prefs.setString(keyReaderTheme, theme);

  // Clear on Logout
  static Future<void> clearAuth() async {
    await prefs.remove(keyAccessToken);
    await prefs.remove(keyRefreshToken);
    await prefs.remove(keyUserInfo);
  }
}
