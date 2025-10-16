import 'package:flutter/material.dart';

class ProductHeader extends StatelessWidget {
  final bool isDetailScreen;
  const ProductHeader({
    Key? key,
    this.isDetailScreen = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        ClipOval(
          child: Container(
            height: isDetailScreen ? 60.0 : 50.0,
            width: isDetailScreen ? 60.0 : 50.0,
            color: Colors.grey.shade200,
          ),
        ),
        const SizedBox(width: 15.0),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Dried Egg & Beans Alligator',
                style: TextStyle(
                    fontSize: isDetailScreen ? 18.0 : 16.0,
                    color: Colors.white),
                overflow: TextOverflow.ellipsis,
                maxLines: 1,
              ),
              const SizedBox(height: 3),
              Text(
                'Sint sed ullam magni laborum quantity',
                style: TextStyle(
                    fontSize: isDetailScreen ? 18.0 : 16.0,
                    color: Colors.white70),
                overflow: TextOverflow.ellipsis,
                maxLines: 1,
              ),
            ],
          ),
        ),
        const SizedBox(width: 10),
        Column(
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
      ],
    );
  }
}
