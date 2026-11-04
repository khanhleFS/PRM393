import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

class AppLogo extends StatelessWidget {
  final double? size;
  final double? width;
  final double? height;
  final BoxFit fit;
  final BorderRadius? borderRadius;

  const AppLogo({
    super.key,
    this.size,
    this.width,
    this.height,
    this.fit = BoxFit.contain,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    final double w = width ?? size ?? 40;
    final double h = height ?? size ?? 40;

    Widget logoWidget = SvgPicture.asset(
      'assets/images/logo.svg',
      width: w,
      height: h,
      fit: fit,
    );

    if (borderRadius != null) {
      logoWidget = ClipRRect(
        borderRadius: borderRadius!,
        child: logoWidget,
      );
    }

    return SizedBox(
      width: w,
      height: h,
      child: logoWidget,
    );
  }
}
