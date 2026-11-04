import 'package:dio/dio.dart';
import '../../core/constants/api_endpoints.dart';
import '../../core/network/api_client.dart';
import '../../core/network/api_response.dart';
import '../models/chapter_model.dart';
import '../models/novel_model.dart';

class AuthorRepository {
  final ApiClient _client = ApiClient();

  /// Lấy danh sách các bộ truyện do tác giả hiện tại sáng tác
  Future<List<NovelModel>> getMyNovels() async {
    try {
      final response = await _client.dio.get(ApiEndpoints.authorNovels);
      final apiRes = ApiResponse<List<dynamic>>.fromJson(
        response.data as Map<String, dynamic>,
        (json) => json as List<dynamic>,
      );

      if (apiRes.isSuccess && apiRes.result != null) {
        return apiRes.result!
            .map((e) => NovelModel.fromJson(e as Map<String, dynamic>))
            .toList();
      }
      return [];
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ??
          e.message ??
          'Lỗi tải danh sách truyện của tác giả';
      throw Exception(msg);
    }
  }

  /// Lấy thông tin chi tiết một bộ truyện của tác giả
  Future<NovelModel> getNovelDetail(dynamic novelId) async {
    try {
      final response =
          await _client.dio.get(ApiEndpoints.authorNovelDetail(novelId));
      final apiRes = ApiResponse<Map<String, dynamic>>.fromJson(
        response.data as Map<String, dynamic>,
        (json) => json as Map<String, dynamic>,
      );

      if (apiRes.isSuccess && apiRes.result != null) {
        return NovelModel.fromJson(apiRes.result!);
      }
      throw Exception(apiRes.message);
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ??
          e.message ??
          'Lỗi tải thông tin bộ truyện';
      throw Exception(msg);
    }
  }

  /// Tạo bộ truyện mới
  Future<NovelModel> createNovel({
    required String title,
    required String description,
    required String coverImageUrl,
    required String status,
    required List<String> categoryIds,
  }) async {
    try {
      final data = <String, dynamic>{
        'title': title.trim(),
        'description': description.trim(),
        'coverImageUrl': coverImageUrl.trim().isNotEmpty
            ? coverImageUrl.trim()
            : 'https://picsum.photos/seed/${DateTime.now().millisecondsSinceEpoch}/400/600',
        'status': status,
        'categoryIds': categoryIds,
      };

      final response = await _client.dio.post(
        ApiEndpoints.authorNovels,
        data: data,
      );

      final apiRes = ApiResponse<Map<String, dynamic>>.fromJson(
        response.data as Map<String, dynamic>,
        (json) => json as Map<String, dynamic>,
      );

      if (apiRes.isSuccess && apiRes.result != null) {
        return NovelModel.fromJson(apiRes.result!);
      }
      throw Exception(apiRes.message.isNotEmpty
          ? apiRes.message
          : 'Không thể tạo bộ truyện');
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ??
          e.message ??
          'Lỗi tạo bộ truyện mới';
      throw Exception(msg);
    }
  }

  /// Cập nhật thông tin bộ truyện
  Future<NovelModel> updateNovel({
    required dynamic novelId,
    required String title,
    required String description,
    required String coverImageUrl,
    required String status,
    required List<String> categoryIds,
  }) async {
    try {
      final data = <String, dynamic>{
        'title': title.trim(),
        'description': description.trim(),
        'coverImageUrl': coverImageUrl.trim().isNotEmpty
            ? coverImageUrl.trim()
            : 'https://picsum.photos/seed/$novelId/400/600',
        'status': status,
        'categoryIds': categoryIds,
      };

      final response = await _client.dio.put(
        ApiEndpoints.authorNovelDetail(novelId),
        data: data,
      );

      final apiRes = ApiResponse<Map<String, dynamic>>.fromJson(
        response.data as Map<String, dynamic>,
        (json) => json as Map<String, dynamic>,
      );

      if (apiRes.isSuccess && apiRes.result != null) {
        return NovelModel.fromJson(apiRes.result!);
      }
      throw Exception(apiRes.message.isNotEmpty
          ? apiRes.message
          : 'Không thể cập nhật truyện');
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ??
          e.message ??
          'Lỗi cập nhật bộ truyện';
      throw Exception(msg);
    }
  }

  /// Xóa bộ truyện
  Future<void> deleteNovel(dynamic novelId) async {
    try {
      final response =
          await _client.dio.delete(ApiEndpoints.authorNovelDetail(novelId));
      final apiRes = ApiResponse.fromJson(response.data as Map<String, dynamic>);
      if (!apiRes.isSuccess) {
        throw Exception(apiRes.message.isNotEmpty
            ? apiRes.message
            : 'Không thể xóa bộ truyện');
      }
    } on DioException catch (e) {
      final msg =
          e.response?.data?['message'] ?? e.message ?? 'Lỗi khi xóa bộ truyện';
      throw Exception(msg);
    }
  }

  /// Lấy danh sách chương của một bộ truyện
  Future<List<ChapterModel>> getNovelChapters(dynamic novelId) async {
    try {
      final response =
          await _client.dio.get(ApiEndpoints.novelChapters(novelId));
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
      final msg = e.response?.data?['message'] ??
          e.message ??
          'Lỗi tải danh sách chương';
      throw Exception(msg);
    }
  }

  /// Tạo / Viết chương mới cho truyện
  Future<ChapterModel> createChapter({
    required dynamic novelId,
    required String title,
    required String content,
    required int chapterNumber,
    required int coinPrice,
    required String status,
  }) async {
    try {
      final data = <String, dynamic>{
        'title': title.trim(),
        'content': content.trim(),
        'chapterNumber': chapterNumber,
        'coinPrice': coinPrice,
        'status': status,
      };

      final response = await _client.dio.post(
        ApiEndpoints.authorNovelChapters(novelId),
        data: data,
      );

      final apiRes = ApiResponse<Map<String, dynamic>>.fromJson(
        response.data as Map<String, dynamic>,
        (json) => json as Map<String, dynamic>,
      );

      if (apiRes.isSuccess && apiRes.result != null) {
        return ChapterModel.fromJson(apiRes.result!);
      }
      throw Exception(apiRes.message.isNotEmpty
          ? apiRes.message
          : 'Không thể tạo chương mới');
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ??
          e.message ??
          'Lỗi khi xuất bản chương mới';
      throw Exception(msg);
    }
  }

  /// Cập nhật thông tin / nội dung chương
  Future<ChapterModel> updateChapter({
    required dynamic novelId,
    required dynamic chapterId,
    required String title,
    required String content,
    required int chapterNumber,
    required int coinPrice,
    required String status,
  }) async {
    try {
      final data = <String, dynamic>{
        'title': title.trim(),
        'content': content.trim(),
        'chapterNumber': chapterNumber,
        'coinPrice': coinPrice,
        'status': status,
      };

      final response = await _client.dio.put(
        ApiEndpoints.authorChapterDetail(novelId, chapterId),
        data: data,
      );

      final apiRes = ApiResponse<Map<String, dynamic>>.fromJson(
        response.data as Map<String, dynamic>,
        (json) => json as Map<String, dynamic>,
      );

      if (apiRes.isSuccess && apiRes.result != null) {
        return ChapterModel.fromJson(apiRes.result!);
      }
      throw Exception(apiRes.message.isNotEmpty
          ? apiRes.message
          : 'Không thể cập nhật chương');
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ??
          e.message ??
          'Lỗi cập nhật chương';
      throw Exception(msg);
    }
  }

  /// Xóa một chương truyện
  Future<void> deleteChapter({
    required dynamic novelId,
    required dynamic chapterId,
  }) async {
    try {
      final response = await _client.dio
          .delete(ApiEndpoints.authorChapterDetail(novelId, chapterId));
      final apiRes = ApiResponse.fromJson(response.data as Map<String, dynamic>);
      if (!apiRes.isSuccess) {
        throw Exception(apiRes.message.isNotEmpty
            ? apiRes.message
            : 'Không thể xóa chương truyện');
      }
    } on DioException catch (e) {
      final msg =
          e.response?.data?['message'] ?? e.message ?? 'Lỗi khi xóa chương';
      throw Exception(msg);
    }
  }

  /// Lấy danh sách thể loại
  Future<List<CategoryModel>> getCategories() async {
    try {
      final response = await _client.dio.get(ApiEndpoints.categories);
      final apiRes = ApiResponse<List<dynamic>>.fromJson(
        response.data as Map<String, dynamic>,
        (json) => json as List<dynamic>,
      );

      if (apiRes.isSuccess && apiRes.result != null) {
        return apiRes.result!
            .map((e) => CategoryModel.fromJson(e as Map<String, dynamic>))
            .toList();
      }
      return [];
    } on DioException catch (_) {
      return [];
    }
  }
}
