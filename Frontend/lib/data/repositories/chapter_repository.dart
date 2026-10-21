import 'package:dio/dio.dart';
import '../../core/constants/api_endpoints.dart';
import '../../core/network/api_client.dart';
import '../../core/network/api_response.dart';
import '../../core/security/encryption_service.dart';
import '../../core/storage/local_storage.dart';
import '../models/chapter_model.dart';

class ChapterLockedException implements Exception {
  final String message;
  final int? code;

  ChapterLockedException([
    this.message = 'Chương này yêu cầu trả phí để đọc.',
    this.code,
  ]);

  @override
  String toString() => message;
}

class ChapterRepository {
  final ApiClient _client = ApiClient();

  Future<List<ChapterModel>> getChapters(dynamic novelId) async {
    try {
      final response = await _client.dio.get(ApiEndpoints.novelChapters(novelId));
      final apiRes = ApiResponse<List<dynamic>>.fromJson(
        response.data as Map<String, dynamic>,
        (json) => json as List<dynamic>,
      );

      if (apiRes.isSuccess && apiRes.result != null) {
        return apiRes.result!
            .map((e) => ChapterModel.fromJson(e as Map<String, dynamic>))
            .toList();
      }
      return [];
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ?? e.message ?? 'Lỗi tải danh sách chương';
      throw Exception(msg);
    }
  }

  Future<ChapterModel> readChapter(dynamic novelId, dynamic chapterId) async {
    try {
      // Backend provides readChapter endpoint to increment view count and decrypt
      final response = await _client.dio.post(ApiEndpoints.readChapter(novelId, chapterId));
      final apiRes = ApiResponse<Map<String, dynamic>>.fromJson(
        response.data as Map<String, dynamic>,
        (json) => json as Map<String, dynamic>,
      );

      if (apiRes.isSuccess && apiRes.result != null) {
        final chapter = ChapterModel.fromJson(apiRes.result!);

        // Decrypt AES content if encryptedData & iv are present
        final userEmail = LocalStorage.getUserEmail();
        final decryptedContent = EncryptionService.decryptChapterContent(
          encryptedHex: chapter.encryptedData,
          ivHex: chapter.iv,
          novelId: chapter.novelId,
          chapterNumber: chapter.chapterNumber,
          userEmail: userEmail,
          fallbackContent: chapter.content,
        );

        return ChapterModel(
          id: chapter.id,
          novelId: chapter.novelId,
          chapterNumber: chapter.chapterNumber,
          title: chapter.title,
          slug: chapter.slug,
          content: decryptedContent.isNotEmpty ? decryptedContent : chapter.content,
          encryptedData: chapter.encryptedData,
          iv: chapter.iv,
          audioUrl: chapter.audioUrl,
          status: chapter.status,
          coinPrice: chapter.coinPrice,
          viewCount: chapter.viewCount,
        );
      } else {
        throw Exception(apiRes.message);
      }
    } on DioException catch (e) {
      final code = e.response?.data?['code'];
      final msg = e.response?.data?['message'] ?? e.message ?? 'Lỗi tải nội dung chương';
      if (code == 3009 ||
          code == 3006 ||
          msg.toString().toLowerCase().contains('trả phí') ||
          msg.toString().toLowerCase().contains('locked') ||
          msg.toString().toLowerCase().contains('đăng nhập để đọc')) {
        throw ChapterLockedException(
          msg.toString(),
          code is int ? code : int.tryParse(code.toString()),
        );
      }
      throw Exception(msg);
    }
  }

  Future<ChapterUnlockResponseModel> unlockChapter(dynamic novelId, dynamic chapterId) async {
    try {
      final response = await _client.dio.post(ApiEndpoints.unlockChapter(novelId, chapterId));
      final apiRes = ApiResponse<Map<String, dynamic>>.fromJson(
        response.data as Map<String, dynamic>,
        (json) => json as Map<String, dynamic>,
      );

      if (apiRes.isSuccess && apiRes.result != null) {
        final unlockResult = ChapterUnlockResponseModel.fromJson(apiRes.result!);
        await LocalStorage.updateUserCoins(unlockResult.remainingCoins);
        return unlockResult;
      } else {
        throw Exception(apiRes.message);
      }
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ?? e.message ?? 'Mở khóa chương thất bại';
      throw Exception(msg);
    }
  }
}
