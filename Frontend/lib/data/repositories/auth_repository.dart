import 'package:dio/dio.dart';
import '../../core/constants/api_endpoints.dart';
import '../../core/network/api_client.dart';
import '../../core/network/api_response.dart';
import '../../core/storage/local_storage.dart';
import '../models/user_model.dart';

class AuthRepository {
  final ApiClient _client = ApiClient();

  Future<LoginResponseModel> login(String email, String password) async {
    try {
      final response = await _client.dio.post(
        ApiEndpoints.login,
        data: {'email': email.trim(), 'password': password},
      );

      final apiRes = ApiResponse<Map<String, dynamic>>.fromJson(
        response.data as Map<String, dynamic>,
        (json) => json as Map<String, dynamic>,
      );

      if (apiRes.isSuccess && apiRes.result != null) {
        final loginData = LoginResponseModel.fromJson(apiRes.result!);
        await LocalStorage.saveAccessToken(loginData.accessToken);
        await LocalStorage.saveRefreshToken(loginData.refreshToken);
        await LocalStorage.saveUserInfo(loginData.user.toJson());
        return loginData;
      } else {
        throw Exception(apiRes.message.isNotEmpty ? apiRes.message : 'Đăng nhập thất bại');
      }
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ?? e.message ?? 'Đăng nhập thất bại';
      throw Exception(msg);
    }
  }

  Future<String> register({
    required String username,
    required String email,
    required String password,
    String? phone,
    String? address,
  }) async {
    try {
      final response = await _client.dio.post(
        ApiEndpoints.register,
        data: {
          'username': username.trim(),
          'email': email.trim(),
          'password': password,
          if (phone != null && phone.isNotEmpty) 'phone': phone.trim(),
          if (address != null && address.isNotEmpty) 'address': address.trim(),
        },
      );

      final apiRes = ApiResponse.fromJson(response.data as Map<String, dynamic>);
      if (apiRes.isSuccess) {
        return apiRes.message.isNotEmpty
            ? apiRes.message
            : 'Đăng ký thành công. Vui lòng kiểm tra email để nhận mã OTP.';
      } else {
        throw Exception(apiRes.message);
      }
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ?? e.message ?? 'Đăng ký thất bại';
      throw Exception(msg);
    }
  }

  Future<bool> verifyOtp(String email, String otpCode) async {
    try {
      final response = await _client.dio.post(
        ApiEndpoints.verifyOtp,
        data: {'email': email.trim(), 'otpCode': otpCode.trim()},
      );

      final apiRes = ApiResponse.fromJson(response.data as Map<String, dynamic>);
      return apiRes.isSuccess;
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ?? e.message ?? 'Xác thực OTP thất bại';
      throw Exception(msg);
    }
  }

  Future<void> logout() async {
    try {
      await _client.dio.post(ApiEndpoints.logout);
    } catch (_) {
      // Ignore network errors on logout
    } finally {
      await LocalStorage.clearAuth();
    }
  }

  UserModel? getCurrentUser() {
    final userMap = LocalStorage.getUserInfo();
    if (userMap != null) {
      return UserModel.fromJson(userMap);
    }
    return null;
  }

  bool isAuthenticated() {
    final token = LocalStorage.getAccessToken();
    return token != null && token.isNotEmpty;
  }
}
