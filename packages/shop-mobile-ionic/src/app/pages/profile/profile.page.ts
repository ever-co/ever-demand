import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';

@Component({
  selector: 'e-cu-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.css'],
})
export class ProfilePage implements OnInit {

  constructor(
    private location: Location,
    public translate: TranslateService
  ) { }

  ngOnInit() {
  }

  goBack() {
		this.location.back();
	}

}
