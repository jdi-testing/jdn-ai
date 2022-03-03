import { request } from "../services/backend";


describe("Test backend service", () => {
  describe("Properly concat GET params", () => {
    test("concat one param", () => {
      const res = request.concatGetUrl("some_get_url", {id: 1010});
      expect(res).toBe("some_get_url?id=1010");
    });
  });
});
