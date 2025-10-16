import 'package:flutter/material.dart';
import 'package:shop_flutter_mobile/constants/colors.dart';
import 'package:shop_flutter_mobile/screens/products/products.dart';

class ProductSlide extends StatelessWidget {
  const ProductSlide({Key? key}) : super(key: key);

  final customColor = const AppColors();

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Column(
          children: [
            SizedBox(
              height: MediaQuery.of(context).size.height * 0.60,
              child: Container(
                decoration: const BoxDecoration(
                  image: DecorationImage(
                    image: AssetImage('assets/imgs/spiced-pasta.webp'),
                    fit: BoxFit.cover,
                  ),
                ),
              ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.only(
                  top: 25.0,
                  left: 7.5,
                  right: 7.5,
                  bottom: 7.5,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 10.0),
                      child: Text(
                        'Sushi box',
                        style: TextStyle(
                          fontSize: 22.0,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    const SizedBox(height: 7.5),
                    const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 10.0),
                      child: Text(
                        'Sushi box',
                        style: TextStyle(fontSize: 16.0, color: Colors.white),
                      ),
                    ),
                    const Spacer(),
                    Row(
                      children: [
                        Expanded(
                          flex: 2,
                          child: MaterialButton(
                            padding: const EdgeInsets.symmetric(vertical: 13),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(5.0),
                            ),
                            elevation: 0,
                            color: customColor.everSignin,
                            onPressed: () {},
                            child: const Text(
                              'Buy for 40\$',
                              style: TextStyle(
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10.0),
                        Expanded(
                          flex: 1,
                          child: MaterialButton(
                            padding: const EdgeInsets.symmetric(vertical: 13),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(5.0),
                            ),
                            elevation: 0,
                            color: customColor.primaryColor,
                            onPressed: () => Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (context) =>
                                    const ProductDetailsScreen(),
                              ),
                            ),
                            child: const Text(
                              'Details',
                              style: TextStyle(color: Colors.white),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            )
          ],
        ),
        Positioned(
          top: (MediaQuery.of(context).size.height * 0.60) - 30.0,
          right: 10.0,
          child: ClipOval(
            child: Container(
              height: 60.0,
              width: 60.0,
              color: Colors.grey.shade200,
            ),
          ),
        ),
        Positioned(
          top: 10,
          right: 10,
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                    vertical: 10.0, horizontal: 15.0),
                decoration: BoxDecoration(
                  color: customColor.primaryColor.withOpacity(0.6),
                  borderRadius: BorderRadius.circular(8.0),
                ),
                child: Column(
                  children: const [
                    Text(
                      '30-60 min',
                      style: TextStyle(fontSize: 10.0, color: Colors.white),
                    ),
                    Text(
                      'Delivery',
                      style: TextStyle(fontSize: 10.0, color: Colors.white),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.symmetric(
                    vertical: 10.0, horizontal: 15.0),
                decoration: BoxDecoration(
                  color: customColor.primaryColor.withOpacity(0.6),
                  borderRadius: BorderRadius.circular(8.0),
                ),
                child: Column(
                  children: const [
                    Text(
                      '30-60 min',
                      style: TextStyle(fontSize: 10.0, color: Colors.white),
                    ),
                    Text(
                      'Delivery',
                      style: TextStyle(fontSize: 10.0, color: Colors.white),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
