import 'package:dio/dio.dart';
import '../../core/constants/api_endpoints.dart';
import '../../core/network/api_client.dart';
import '../../core/network/api_response.dart';
import '../models/novel_model.dart';

class NovelRepository {
  final ApiClient _client = ApiClient();

  Future<NovelPageResponseModel> searchNovels({
    String? query,
    String? category,
    String? status,
    int? minChapters,
    int page = 0,
    int size = 20,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'page': page,
        'size': size,
      };
      if (query != null && query.trim().isNotEmpty) {
        queryParams['q'] = query.trim();
      }
      if (category != null && category.trim().isNotEmpty) {
        queryParams['category'] = category.trim();
      }
      if (status != null && status.trim().isNotEmpty) {
        queryParams['status'] = status.trim();
      }
      if (minChapters != null && minChapters > 0) {
        queryParams['minChapters'] = minChapters;
      }

      final response = await _client.dio.get(
        ApiEndpoints.novels,
        queryParameters: queryParams,
      );

      final apiRes = ApiResponse<Map<String, dynamic>>.fromJson(
        response.data as Map<String, dynamic>,
        (json) => json as Map<String, dynamic>,
      );

      if (apiRes.isSuccess && apiRes.result != null) {
        return NovelPageResponseModel.fromJson(apiRes.result!);
      } else {
        throw Exception(apiRes.message);
      }
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ?? e.message ?? 'Lỗi tải danh sách truyện';
      throw Exception(msg);
    }
  }

  Future<NovelModel> getNovelDetail(dynamic idOrSlug) async {
    try {
      final response = await _client.dio.get(ApiEndpoints.novelDetail(idOrSlug));
      final apiRes = ApiResponse<Map<String, dynamic>>.fromJson(
        response.data as Map<String, dynamic>,
        (json) => json as Map<String, dynamic>,
      );

      if (apiRes.isSuccess && apiRes.result != null) {
        return NovelModel.fromJson(apiRes.result!);
      } else {
        throw Exception(apiRes.message);
      }
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ?? e.message ?? 'Lỗi tải chi tiết truyện';
      throw Exception(msg);
    }
  }

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
