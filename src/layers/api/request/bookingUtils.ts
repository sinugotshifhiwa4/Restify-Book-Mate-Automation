import { faker } from "@faker-js/faker";
import { BookingDates } from "./types/bookingRequest.type";

export default class BookingUtils {
  public static getCurrentDate(): string {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }

  public static getDateFromCurrent(daysFromCurrent: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromCurrent);
    return date.toISOString().split("T")[0];
  }

  /**
   * Creates custom dates based on days before/after today
   * @param checkinDays - Number of days for checkin
   * @param checkinIsPast - If true, checkin is in the past (days before today)
   * @param checkoutDays - Number of days for checkout
   * @param checkoutIsPast - If true, checkout is in the past (days before today)
   * @returns BookingDates object with calculated dates
   */
  public static createCustomDates(
    checkinDays: number,
    checkinIsPast: boolean,
    checkoutDays: number,
    checkoutIsPast: boolean,
  ): BookingDates {
    const checkinOffset = checkinIsPast ? -Math.abs(checkinDays) : Math.abs(checkinDays);
    const checkoutOffset = checkoutIsPast ? -Math.abs(checkoutDays) : Math.abs(checkoutDays);

    return {
      checkin: this.getDateFromCurrent(checkinOffset),
      checkout: this.getDateFromCurrent(checkoutOffset),
    };
  }

  public static generateRandomPrice(min: number = 500, max: number = 4500): number {
    return faker.number.int({ min, max });
  }

  public static generateRandomAdditionalNeed(
    customNeeds?: string[],
    defaultIndex: number = 0,
  ): string {
    const defaultNeeds = ["Breakfast", "Late Checkout", "Airport Shuttle", "Sea View", "City View"];

    if (customNeeds) {
      return faker.helpers.arrayElement(customNeeds);
    } else {
      return defaultNeeds[defaultIndex];
    }
  }
}
