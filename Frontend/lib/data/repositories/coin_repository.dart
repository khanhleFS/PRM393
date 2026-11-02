import 'package:dio/dio.dart';

import '../../core/constants/api_endpoints.dart';
import '../../core/network/api_client.dart';
import '../../core/network/api_response.dart';
import '../../core/storage/local_storage.dart';
import '../models/coin_package_model.dart';
import '../models/user_model.dart';

class CoinRepository {
  final ApiClient _client = ApiClient();

  Future<Map<String, dynamic>> getOrder(String id) async {
    final response = await _client.dio.get(
      '${ApiEndpoints.baseUrl}/orders/$id',
    );
    final result = ApiResponse<Map<String, dynamic>>.fromJson(
      response.data as Map<String, dynamic>,
      (json) => json as Map<String, dynamic>,
    );
    if (!result.isSuccess || result.result == null) {
      throw Exception(
        result.message.isEmpty ? 'Không thể kiểm tra đơn hàng' : result.message,
      );
    }
    return result.result!;
  }

  Future<List<CoinPackageModel>> getActivePackages() async {
    try {
      final response = await _client.dio.get(ApiEndpoints.coinPackages);
      final apiRes = ApiResponse<List<dynamic>>.fromJson(
        response.data as Map<String, dynamic>,
        (json) => json as List<dynamic>,
      );

      if (apiRes.isSuccess && apiRes.result != null) {
        return apiRes.result!
            .map((e) => CoinPackageModel.fromJson(e as Map<String, dynamic>))
            .toList();
      }
      return [];
    } on DioException catch (e) {
      final msg =
          e.response?.data?['message'] ??
          e.message ??
          'Lỗi tải danh sách gói xu';
      throw Exception(msg);
    }
  }

  Future<UserModel> getProfile() async {
    try {
      final response = await _client.dio.get(ApiEndpoints.profile);
      final apiRes = ApiResponse<Map<String, dynamic>>.fromJson(
        response.data as Map<String, dynamic>,
        (json) => json as Map<String, dynamic>,
      );

      if (apiRes.isSuccess && apiRes.result != null) {
        final user = UserModel.fromJson(apiRes.result!);
        await LocalStorage.updateUserCoins(user.coinBalance);
        return user;
      } else {
        throw Exception(apiRes.message);
      }
    } on DioException catch (e) {
      final msg =
          e.response?.data?['message'] ??
          e.message ??
          'Lỗi tải hồ sơ người dùng';
      throw Exception(msg);
    }
  }

  Future<List<CoinTransactionModel>> getCoinTransactions({
    int page = 0,
    int size = 20,
  }) async {
    try {
      final response = await _client.dio.get(
        ApiEndpoints.coinTransactions,
        queryParameters: {'page': page, 'size': size},
      );
      final apiRes = ApiResponse<Map<String, dynamic>>.fromJson(
        response.data as Map<String, dynamic>,
        (json) => json as Map<String, dynamic>,
      );

      if (apiRes.isSuccess && apiRes.result != null) {
        final content = apiRes.result!['content'] as List? ?? [];
        return content
            .map(
              (e) => CoinTransactionModel.fromJson(e as Map<String, dynamic>),
            )
            .toList();
      }
      throw Exception(
        apiRes.message.isEmpty
            ? 'Không tải được lịch sử giao dịch'
            : apiRes.message,
      );
    } on DioException catch (_) {
      throw Exception('Không tải được lịch sử giao dịch. Vui lòng thử lại.');
    }
  }

  Future<Map<String, dynamic>> createOrder({
    required String coinPackageId,
    String? orderInfo,
  }) async {
    try {
      final response = await _client.dio.post(
        '${ApiEndpoints.baseUrl}/orders',
        data: {
          'coinPackageId': coinPackageId,
          'orderInfo': orderInfo ?? 'Nap coin cho tai khoan',
          'requestType': 'captureWallet',
          'quantity': 1,
          'platform': 'MOBILE',
        },
      );
      final apiRes = ApiResponse<Map<String, dynamic>>.fromJson(
        response.data as Map<String, dynamic>,
        (json) => json as Map<String, dynamic>,
      );
      if (apiRes.isSuccess && apiRes.result != null) {
        return apiRes.result!;
      }
      throw Exception(
        apiRes.message.isNotEmpty ? apiRes.message : 'Tạo đơn hàng thất bại',
      );
    } on DioException catch (e) {
      final msg =
          e.response?.data?['message'] ??
          e.message ??
          'Lỗi tạo đơn hàng thanh toán';
      throw Exception(msg);
    }
  }
}
