import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:encrypt/encrypt.dart' as enc;
import 'package:flutter/foundation.dart';

class EncryptionService {
  /// Decrypt AES-256-CBC encrypted chapter content matching backend logic:
  /// 1. contextId = "$userIdentifier:novel:$novelId:chapter:$chapterNumber"
  /// 2. seed = "$contextId:$ivHex"
  /// 3. keyBytes = SHA-256(utf8.encode(seed)) (32 bytes)
  /// 4. iv = Hex decode(ivHex) (16 bytes)
  /// 5. ciphertext = Hex decode(encryptedHex)
  /// 6. Decrypt with AES/CBC/PKCS7
  static String decryptChapterContent({
    required String? encryptedHex,
    required String? ivHex,
    required dynamic novelId,
    required dynamic chapterNumber,
    String? userEmail,
    String? fallbackContent,
  }) {
    if (encryptedHex == null ||
        encryptedHex.isEmpty ||
        ivHex == null ||
        ivHex.isEmpty) {
      return fallbackContent ?? '';
    }

    try {
      final userIdentifier =
          (userEmail != null && userEmail.trim().isNotEmpty)
              ? userEmail.trim()
              : 'GUEST_JWT';

      final contextId =
          '$userIdentifier:novel:$novelId:chapter:$chapterNumber';
      final seed = '$contextId:$ivHex';

      // 1. Generate 32-byte key using SHA-256
      final keyDigest = sha256.convert(utf8.encode(seed));
      final key = enc.Key(Uint8List.fromList(keyDigest.bytes));

      // 2. Decode IV
      final ivBytes = _hexToBytes(ivHex);
      final iv = enc.IV(Uint8List.fromList(ivBytes));

      // 3. Decode ciphertext
      final cipherBytes = _hexToBytes(encryptedHex);
      final encryptedData = enc.Encrypted(Uint8List.fromList(cipherBytes));

      // 4. Decrypt
      final encrypter = enc.Encrypter(
        enc.AES(key, mode: enc.AESMode.cbc, padding: 'PKCS7'),
      );
      final decryptedText = encrypter.decrypt(encryptedData, iv: iv);

      return decryptedText;
    } catch (e) {
      debugPrint('[EncryptionService] Decryption failed: $e');
      return fallbackContent ?? '';
    }
  }

  static List<int> _hexToBytes(String hex) {
    final clean = hex.replaceAll(' ', '').trim();
    final bytes = <int>[];
    for (var i = 0; i < clean.length; i += 2) {
      bytes.add(int.parse(clean.substring(i, i + 2), radix: 16));
    }
    return bytes;
  }
}
