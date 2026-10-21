import 'package:dio/dio.dart';
import '../../core/constants/api_endpoints.dart';
import '../../core/network/api_client.dart';
import '../../core/network/api_response.dart';
import '../models/bookmark_model.dart';

class BookmarkRepository {
  final ApiClient _client = ApiClient();

  Future<List<BookmarkModel>> getMyBookmarks() async {
    try {
      final response = await _client.dio.get(ApiEndpoints.bookmarks);
      final apiRes = ApiResponse<List<dynamic>>.fromJson(
        response.data as Map<String, dynamic>,
        (json) => json as List<dynamic>,
      );

      if (apiRes.isSuccess && apiRes.result != null) {
        return apiRes.result!
            .map((e) => BookmarkModel.fromJson(e as Map<String, dynamic>))
            .toList();
      }
      return [];
    } on DioException catch (_) {
      return [];
    }
  }

  Future<BookmarkModel?> getBookmark(dynamic novelId) async {
    try {
      final response = await _client.dio.get(ApiEndpoints.bookmarkByNovel(novelId));
      final apiRes = ApiResponse<Map<String, dynamic>>.fromJson(
        response.data as Map<String, dynamic>,
        (json) => json as Map<String, dynamic>,
      );

      if (apiRes.isSuccess && apiRes.result != null) {
        return BookmarkModel.fromJson(apiRes.result!);
      }
      return null;
    } on DioException catch (_) {
      return null;
    }
  }

  Future<BookmarkModel?> upsertBookmark({
    required dynamic novelId,
    bool isFavorite = true,
    dynamic lastChapterId,
    int? lastPage,
    int? readingProgressPercent,
  }) async {
    try {
      final data = <String, dynamic>{
        'novelId': novelId,
        'isFavorite': isFavorite,
      };
      if (lastChapterId != null) {
        data['lastChapterId'] = lastChapterId;
      }
      if (lastPage != null) {
        data['lastPage'] = lastPage;
      }
      if (readingProgressPercent != null) {
        data['readingProgressPercent'] = readingProgressPercent;
      }

      final response = await _client.dio.post(
        ApiEndpoints.bookmarks,
        data: data,
      );

      final apiRes = ApiResponse<Map<String, dynamic>>.fromJson(
        response.data as Map<String, dynamic>,
        (json) => json as Map<String, dynamic>,
      );

      if (apiRes.isSuccess && apiRes.result != null) {
        return BookmarkModel.fromJson(apiRes.result!);
      }
      throw Exception(
        apiRes.message.isNotEmpty ? apiRes.message : 'Thao tác lưu tủ sách thất bại',
      );
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ?? e.message ?? 'Lỗi cập nhật tủ sách';
      throw Exception(msg);
    }
  }

  Future<bool> removeBookmark(dynamic novelId) async {
    try {
      final response = await _client.dio.delete(ApiEndpoints.bookmarkByNovel(novelId));
      final apiRes = ApiResponse.fromJson(response.data as Map<String, dynamic>);
      if (apiRes.isSuccess) {
        return true;
      }
      throw Exception(
        apiRes.message.isNotEmpty ? apiRes.message : 'Xóa khỏi tủ sách thất bại',
      );
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ?? e.message ?? 'Lỗi xóa khỏi tủ sách';
      throw Exception(msg);
    }
  }
}
