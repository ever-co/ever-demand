import 'package:flutter/material.dart';

Widget myAppBar(String title) {
  return AppBar(
    backgroundColor: Color.fromRGBO(156, 204, 101, 1),
    //background color of Appbar to green
    title: Text(title),
    actions: <Widget>[
      IconButton(
        icon: Icon(Icons.search),
        onPressed: () {
          //action for search icon button
        },
      ),
      IconButton(
        icon: Icon(Icons.person),
        onPressed: () {
          //action for user icon button
        },
      )
    ],
  );
}
