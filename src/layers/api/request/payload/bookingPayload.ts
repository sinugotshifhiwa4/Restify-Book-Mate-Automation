import { faker } from "@faker-js/faker";
import BookingUtils from "../bookingUtils";
import { Booking } from "../types/bookingRequest.type";

export default class BookingPayload {
  private static readonly DEFAULT_CHECKOUT_OFFSET = 5;

  public static createBooking(
    firstName?: string,
    lastName?: string,
    totalprice?: number,
    depositpaid?: boolean,
    checkin?: string,
    checkout?: string,
    additionalneeds?: string,
  ): Booking {
    return {
      firstname: firstName ?? faker.person.firstName(),
      lastname: lastName ?? faker.person.lastName(),
      totalprice: totalprice ?? BookingUtils.generateRandomPrice(),
      depositpaid: depositpaid ?? faker.datatype.boolean(),
      bookingdates: {
        checkin: checkin ?? BookingUtils.getCurrentDate(),
        checkout: checkout ?? BookingUtils.getDateFromCurrent(this.DEFAULT_CHECKOUT_OFFSET),
      },
      additionalneeds: additionalneeds ?? BookingUtils.generateRandomAdditionalNeed(),
    };
  }
}
