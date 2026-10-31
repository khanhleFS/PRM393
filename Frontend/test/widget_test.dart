import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:frontend/bloc/auth/auth_bloc.dart';
import 'package:frontend/bloc/auth/auth_event.dart';
import 'package:frontend/core/constants/api_endpoints.dart';
import 'package:frontend/core/storage/local_storage.dart';
import 'package:frontend/core/theme/app_theme.dart';
import 'package:frontend/data/models/user_model.dart';
import 'package:frontend/data/models/coin_package_model.dart';
import 'package:frontend/data/repositories/auth_repository.dart';
import 'package:frontend/data/repositories/coin_repository.dart';
import 'package:frontend/presentation/screens/auth/login_screen.dart';
import 'package:frontend/presentation/screens/auth/register_screen.dart';
import 'package:frontend/presentation/screens/auth/otp_verification_screen.dart';
import 'package:frontend/presentation/screens/profile/profile_screen.dart';
import 'package:frontend/presentation/screens/coin/coin_shop_screen.dart';
import 'package:frontend/presentation/screens/coin/coin_history_screen.dart';

class FakeAuthRepository extends AuthRepository {
  bool signedIn = false;
  final verifiedCodes = <String>[];
  UserModel user = UserModel(
    id: 'u1',
    username: 'Nguyễn Văn An',
    email: 'an@example.com',
    role: 'USER',
    coinBalance: 12345,
  );
  @override
  bool isAuthenticated() => signedIn;
  @override
  UserModel? getCurrentUser() => signedIn ? user : null;
  @override
  Future<UserModel> getProfile() async => user;
  @override
  Future<bool> verifyOtp(String email, String otpCode) async {
    verifiedCodes.add(otpCode);
    return false;
  }
}

class FakeCoinRepository extends CoinRepository {
  bool failHistory = false;
  List<CoinTransactionModel> history = [];
  @override
  Future<List<CoinTransactionModel>> getCoinTransactions({
    int page = 0,
    int size = 20,
  }) async {
    if (failHistory) throw Exception('history offline');
    return history.skip(page * size).take(size).toList();
  }

  bool sepayTest = false;
  String orderStatus = 'PENDING';
  @override
  Future<Map<String, dynamic>> getOrder(String id) async => {
    'status': orderStatus,
  };
  int orderCalls = 0;
  bool failPackages = false;
  Completer<Map<String, dynamic>>? pendingOrder;
  @override
  Future<List<CoinPackageModel>> getActivePackages() async {
    if (failPackages) throw Exception('Không thể kết nối');
    return [
      CoinPackageModel(
        id: 'p1',
        name: 'Gói khởi đầu',
        priceVnd: 10000,
        baseCoins: 100,
      ),
    ];
  }

  @override
  Future<Map<String, dynamic>> createOrder({
    required String coinPackageId,
    String? orderInfo,
  }) async {
    orderCalls++;
    return pendingOrder == null
        ? (sepayTest
              ? {
                  'id': 'x',
                  'paymentProvider': 'SEPAY_TEST',
                  'paymentCode': 'NVTEST',
                  'amountVnd': 10000,
                }
              : {'id': 'x', 'payUrl': 'https://example.com/pay'})
        : pendingOrder!.future;
  }
}

void main() {
  test('History model reads the backend transaction contract', () {
    final tx = CoinTransactionModel.fromJson({
      'transactionId': 'tx1',
      'transactionType': 'UNLOCKED_CHAPTER',
      'amount': -10,
      'balanceAfter': 90,
      'note': 'Mở khóa chương 6',
      'createdAt': '2026-10-31T00:00:00Z',
    });
    expect(tx.id, 'tx1');
    expect(tx.type, 'UNLOCKED_CHAPTER');
    expect(tx.amount, -10);
    expect(tx.balanceAfter, 90);
  });
  setUp(() async {
    GoogleFonts.config.allowRuntimeFetching = false;
    SharedPreferences.setMockInitialValues({});
    await LocalStorage.init();
    await ApiEndpoints.init();
  });

  Future<AuthBloc> mount(
    WidgetTester tester,
    Widget screen, {
    FakeAuthRepository? auth,
    FakeCoinRepository? coins,
    double width = 320,
  }) async {
    tester.view.physicalSize = Size(width, 720);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    final bloc = AuthBloc(authRepository: auth ?? FakeAuthRepository());
    addTearDown(bloc.close);
    bloc.add(CheckAuthStatusEvent());
    await tester.pumpWidget(
      RepositoryProvider<CoinRepository>.value(
        value: coins ?? FakeCoinRepository(),
        child: BlocProvider.value(
          value: bloc,
          child: MaterialApp(theme: AppTheme.lightTheme, home: screen),
        ),
      ),
    );
    await tester.pumpAndSettle();
    return bloc;
  }

  testWidgets('Login validates empty input on a narrow screen', (tester) async {
    await mount(tester, const LoginScreen());
    await tester.ensureVisible(
      find.widgetWithText(ElevatedButton, 'Đăng nhập'),
    );
    await tester.tap(find.widgetWithText(ElevatedButton, 'Đăng nhập'));
    await tester.pumpAndSettle();
    expect(find.text('Vui lòng nhập email'), findsOneWidget);
    expect(find.text('Vui lòng nhập mật khẩu'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('Register scrolls with keyboard on a narrow screen', (
    tester,
  ) async {
    await mount(tester, const RegisterScreen());
    tester.view.viewInsets = const FakeViewPadding(bottom: 300);
    addTearDown(tester.view.resetViewInsets);
    await tester.pumpAndSettle();
    await tester.ensureVisible(find.widgetWithText(ElevatedButton, 'Đăng ký'));
    await tester.tap(find.widgetWithText(ElevatedButton, 'Đăng ký'));
    await tester.pumpAndSettle();
    expect(find.text('Họ tên không được để trống.'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets(
    'OTP rejects incomplete codes and distributes pasted six digits',
    (tester) async {
      final auth = FakeAuthRepository();
      await mount(
        tester,
        const OtpVerificationScreen(email: 'an@example.com'),
        auth: auth,
      );
      await tester.enterText(find.byType(TextField).first, '1234');
      await tester.tap(find.text('Kích hoạt tài khoản'));
      await tester.pumpAndSettle();
      expect(auth.verifiedCodes, isEmpty);
      expect(find.text('Vui lòng nhập đủ 6 chữ số OTP.'), findsOneWidget);
      await tester.enterText(find.byType(TextField).first, '123456');
      await tester.tap(find.text('Kích hoạt tài khoản'));
      await tester.pumpAndSettle();
      expect(auth.verifiedCodes, ['123456']);
      expect(tester.takeException(), isNull);
    },
  );

  testWidgets('Backend URL validation and saving survive dialog dismissal', (
    tester,
  ) async {
    await mount(tester, const ProfileScreen());
    await tester.tap(find.text('Cấu hình Backend API IP'));
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(TextFormField), 'javascript:bad');
    await tester.tap(find.text('Lưu cấu hình'));
    await tester.pumpAndSettle();
    expect(
      find.text('Nhập URL http/https hợp lệ, gồm đường dẫn /api.'),
      findsOneWidget,
    );
    await tester.enterText(
      find.byType(TextFormField),
      'http://localhost:9090/api',
    );
    await tester.tap(find.text('Lưu cấu hình'));
    await tester.pumpAndSettle();
    expect(ApiEndpoints.baseUrl, 'http://localhost:9090/api');
    expect(tester.takeException(), isNull);
  });

  testWidgets('Authenticated profile displays balance on a narrow screen', (
    tester,
  ) async {
    await mount(
      tester,
      const ProfileScreen(),
      auth: FakeAuthRepository()..signedIn = true,
    );
    expect(find.text('12.345 xu'), findsOneWidget);
    expect(find.text('Nguyễn Văn An'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('Shop prevents guest checkout', (tester) async {
    final coins = FakeCoinRepository();
    await mount(tester, const CoinShopScreen(), coins: coins);
    await tester.tap(find.text('10.000 đ'));
    await tester.pumpAndSettle();
    expect(coins.orderCalls, 0);
    expect(find.text('Vui lòng đăng nhập để nạp xu.'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets(
    'History displays credits, debits and balances on a narrow screen',
    (tester) async {
      final coins = FakeCoinRepository()
        ..history = [
          CoinTransactionModel.fromJson({
            'transactionId': 'a',
            'transactionType': 'TOPUP',
            'amount': 100,
            'balanceAfter': 100,
            'createdAt': '2026-10-31T00:00:00Z',
          }),
          CoinTransactionModel.fromJson({
            'transactionId': 'b',
            'transactionType': 'UNLOCKED_CHAPTER',
            'amount': -10,
            'balanceAfter': 90,
            'createdAt': '2026-10-31T00:01:00Z',
          }),
        ];
      await mount(
        tester,
        const CoinHistoryScreen(),
        coins: coins,
        auth: FakeAuthRepository()..signedIn = true,
      );
      expect(find.text('+100 xu'), findsOneWidget);
      expect(find.text('−10 xu'), findsOneWidget);
      expect(find.text('Số dư sau giao dịch: 90 xu'), findsOneWidget);
      expect(tester.takeException(), isNull);
    },
  );

  testWidgets('History network errors are distinct from an empty ledger', (
    tester,
  ) async {
    final coins = FakeCoinRepository()..failHistory = true;
    await mount(tester, const CoinHistoryScreen(), coins: coins);
    expect(
      find.text('Không tải được lịch sử giao dịch. Vui lòng thử lại.'),
      findsOneWidget,
    );
    expect(find.text('Chưa có giao dịch xu.'), findsNothing);
    coins.failHistory = false;
    await tester.tap(find.text('Thử lại'));
    await tester.pumpAndSettle();
    expect(find.text('Chưa có giao dịch xu.'), findsOneWidget);
  });

  testWidgets('Shop refresh button fetches the new server balance', (
    tester,
  ) async {
    final auth = FakeAuthRepository()..signedIn = true;
    await mount(tester, const CoinShopScreen(), auth: auth);
    expect(find.text('12.345 Xu'), findsOneWidget);
    auth.user = UserModel(
      id: 'u1',
      username: 'Nguyễn Văn An',
      email: 'an@example.com',
      role: 'USER',
      coinBalance: 100,
    );
    await tester.tap(find.byTooltip('Làm mới số dư'));
    await tester.pumpAndSettle();
    expect(find.text('100 Xu'), findsOneWidget);
    expect(find.text('12.345 Xu'), findsNothing);
    expect(tester.takeException(), isNull);
  });

  testWidgets('Shop shows retry after a failed package request', (
    tester,
  ) async {
    final coins = FakeCoinRepository()..failPackages = true;
    await mount(tester, const CoinShopScreen(), coins: coins);
    expect(find.text('Không thể kết nối'), findsOneWidget);
    coins.failPackages = false;
    await tester.tap(find.text('Thử lại'));
    await tester.pumpAndSettle();
    expect(find.text('Gói khởi đầu'), findsOneWidget);
  });

  testWidgets('SePay checkout waits for backend completion before dismissing', (
    tester,
  ) async {
    final coins = FakeCoinRepository()..sepayTest = true;
    await mount(
      tester,
      const CoinShopScreen(),
      auth: FakeAuthRepository()..signedIn = true,
      coins: coins,
    );
    await tester.tap(find.text('10.000 đ'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Thanh toán ngay'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 400));
    expect(
      find.text('SEPAY TEST MODE — KHÔNG CHUYỂN TIỀN THẬT'),
      findsOneWidget,
    );
    expect(find.text('NVTEST'), findsOneWidget);
    await tester.tap(find.text('Kiểm tra số dư'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 400));
    expect(find.text('Đơn hàng đang chờ thanh toán'), findsOneWidget);
    expect(
      find.text('Đơn hàng: PENDING. Chưa có xác nhận thanh toán.'),
      findsOneWidget,
    );
    coins.orderStatus = 'COMPLETED';
    await tester.tap(find.text('Kiểm tra số dư'));
    await tester.pumpAndSettle();
    expect(find.text('Đơn hàng đang chờ thanh toán'), findsNothing);
    expect(tester.takeException(), isNull);
  });

  testWidgets(
    'Checkout handles short order IDs and disables duplicate orders',
    (tester) async {
      final auth = FakeAuthRepository()..signedIn = true;
      final coins = FakeCoinRepository()
        ..pendingOrder = Completer<Map<String, dynamic>>();
      await mount(
        tester,
        const CoinShopScreen(),
        auth: auth,
        coins: coins,
        width: 600,
      );
      await tester.tap(find.text('10.000 đ'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Thanh toán ngay'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 400));
      expect(coins.orderCalls, 1);
      expect(
        tester
            .widget<ElevatedButton>(
              find.widgetWithText(ElevatedButton, '10.000 đ'),
            )
            .onPressed,
        isNull,
      );
      coins.pendingOrder!.complete({
        'id': 'x',
        'payUrl': 'https://example.com/pay',
      });
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 400));
      expect(find.text('Mã đơn hàng: x'), findsOneWidget);
      expect(find.text('Đơn hàng đang chờ thanh toán'), findsOneWidget);
      await tester.tap(find.text('Kiểm tra số dư'));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
    },
  );
}
