class Environment {
  final bool production;

  final String VERSION;
  // 'slides' | 'list'
  final String PRODUCTS_VIEW_TYPE;

  // 'popup' or 'page'
  final String ORDER_INFO_TYPE;

  final String API_FILE_UPLOAD_URL;

  final String INVITE_BY_CODE_LOGO;
  final String NO_INTERNET_LOGO;

  final String COMPANY_NAME;

  final String GOOGLE_MAPS_API_KEY;

  final String GOOGLE_ANALYTICS_API_KEY;

  final String FAKE_UUID;

  // Not secret MixPanel Token
  final String MIXPANEL_API_KEY;

  final String DEFAULT_LANGUAGE;
  final String DEFAULT_LOCALE;

  final String DELIVERY_TIME_MIN;
  final String DELIVERY_TIME_MAX;

  final String SUPPORT_NUMBER;

  final String STRIPE_PUBLISHABLE_KEY;

  final String STRIPE_POP_UP_LOGO;

  final String MAP_MERCHANT_ICON_LINK;

  final String MAP_USER_ICON_LINK;

  final String MAP_CARRIER_ICON_LINK;

  final String DEFAULT_LATITUDE;
  final String DEFAULT_LONGITUDE;

  final String GQL_ENDPOINT;
  final String GQL_SUBSCRIPTIONS_ENDPOINT;
  final String SERVICES_ENDPOINT;
  final String HTTPS_SERVICES_ENDPOINT;

  final FakeInvite FAKE_INVITE;

  // For maintenance micro service
  final String SETTINGS_APP_TYPE;
  final String SETTINGS_MAINTENANCE_API_URL;

  // For "single" merchant (multiple branches)
  final List<String> MERCHANT_IDS;

  final bool SHOPPING_CART;

  Environment(
      this.production,
      this.VERSION,
      this.PRODUCTS_VIEW_TYPE,
      this.ORDER_INFO_TYPE,
      this.API_FILE_UPLOAD_URL,
      this.INVITE_BY_CODE_LOGO,
      this.NO_INTERNET_LOGO,
      this.COMPANY_NAME,
      this.GOOGLE_MAPS_API_KEY,
      this.GOOGLE_ANALYTICS_API_KEY,
      this.FAKE_UUID,
      this.MIXPANEL_API_KEY,
      this.DEFAULT_LANGUAGE,
      this.DEFAULT_LOCALE,
      this.DELIVERY_TIME_MIN,
      this.DELIVERY_TIME_MAX,
      this.SUPPORT_NUMBER,
      this.STRIPE_PUBLISHABLE_KEY,
      this.STRIPE_POP_UP_LOGO,
      this.MAP_MERCHANT_ICON_LINK,
      this.MAP_USER_ICON_LINK,
      this.MAP_CARRIER_ICON_LINK,
      this.DEFAULT_LATITUDE,
      this.DEFAULT_LONGITUDE,
      this.GQL_ENDPOINT,
      this.GQL_SUBSCRIPTIONS_ENDPOINT,
      this.SERVICES_ENDPOINT,
      this.HTTPS_SERVICES_ENDPOINT,
      this.FAKE_INVITE,
      this.SETTINGS_APP_TYPE,
      this.SETTINGS_MAINTENANCE_API_URL,
      this.MERCHANT_IDS,
      this.SHOPPING_CART);
}

class FakeInvite {
  final String ID;
  final String CITY;
  final String POSTCODE;
  final String ADDRESS;
  final String HOUSE;
  final String CREATED_AT;
  final String UPDATED_AT;
  final String APARTMENT;
  final int CODE;
  final int COUNTRY_ID;

  FakeInvite(
      this.ID,
      this.CITY,
      this.POSTCODE,
      this.ADDRESS,
      this.HOUSE,
      this.CREATED_AT,
      this.UPDATED_AT,
      this.APARTMENT,
      this.CODE,
      this.COUNTRY_ID);
}
