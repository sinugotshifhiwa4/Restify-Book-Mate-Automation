export interface Booking {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: BookingDates;
  additionalneeds: string;
}

export interface BookingDates {
  checkin: string;
  checkout: string;
}

export interface CustomDateOptions {
  checkinDays: number;
  checkinIsPast: boolean;
  checkoutDays: number;
  checkoutIsPast: boolean;
}
