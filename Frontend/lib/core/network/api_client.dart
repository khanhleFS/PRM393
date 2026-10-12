import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../constants/api_endpoints.dart';
import '../storage/local_storage.dart';

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;

  late final Dio dio;

  ApiClient._internal() {
    dio = Dio(
      BaseOptions(
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          final token = LocalStorage.getAccessToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          debugPrint('[API] ${options.method} => ${options.uri}');
          return handler.next(options);
        },
        onResponse: (response, handler) {
          debugPrint('[API Response] ${response.statusCode} <= ${response.requestOptions.uri}');
          return handler.next(response);
        },
        onError: (DioException error, handler) async {
          debugPrint('[API Error] ${error.response?.statusCode} <= ${error.requestOptions.uri}: ${error.message}');

          // Check if 401 Unauthorized and attempt token refresh
          if (error.response?.statusCode == 401 &&
              !error.requestOptions.path.contains('/auth/login') &&
              !error.requestOptions.path.contains('/auth/refresh')) {
            final refreshToken = LocalStorage.getRefreshToken();
            if (refreshToken != null && refreshToken.isNotEmpty) {
              try {
                final refreshResponse = await Dio().post(
                  ApiEndpoints.refreshToken,
                  data: {'refreshToken': refreshToken},
                );

                if (refreshResponse.statusCode == 200 &&
                    refreshResponse.data != null &&
                    refreshResponse.data['result'] != null) {
                  final newAccess = refreshResponse.data['result']['accessToken'] as String?;
                  final newRefresh = refreshResponse.data['result']['refreshToken'] as String?;

                  if (newAccess != null) {
                    await LocalStorage.saveAccessToken(newAccess);
                    if (newRefresh != null) {
                      await LocalStorage.saveRefreshToken(newRefresh);
                    }

                    // Retry original request with new token
                    final opts = error.requestOptions;
                    opts.headers['Authorization'] = 'Bearer $newAccess';
                    final cloneReq = await dio.request(
                      opts.path,
                      options: Options(
                        method: opts.method,
                        headers: opts.headers,
                      ),
                      data: opts.data,
                      queryParameters: opts.queryParameters,
                    );
                    return handler.resolve(cloneReq);
                  }
                }
              } catch (refreshErr) {
                debugPrint('[API] Refresh token failed: $refreshErr');
                await LocalStorage.clearAuth();
              }
            }
          }

          return handler.next(error);
        },
      ),
    );
  }
}
