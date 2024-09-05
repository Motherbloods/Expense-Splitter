const {
  login,
  login_form,
  register,
  register_form,
  logout,
} = require("../controller/auth.controller");
const User = require("../models/user");

jest.mock("../models/user");

describe("Auth Controller", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      render: jest.fn(),
      redirect: jest.fn(),
    };
  });

  describe("register_form", () => {
    it("should render the create form with user data", async () => {
      const dummyUser = {
        _id: "jdsajkdskjlffkdsal11",
        username: "habib",
        password: "habib123",
        confirmPassword: "habib123",
      };

      User.findById.mockResolvedValue(dummyUser);
    });
  });
});
