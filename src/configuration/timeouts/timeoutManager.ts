import EnvironmentDetector from "../environment/detector/environmentDetector";

export default class TimeoutManager {
  private static CI_MULTIPLIER = 2;

  public static timeout(base: number): number {
    return EnvironmentDetector.isCI() ? base * TimeoutManager.CI_MULTIPLIER : base;
  }
}
