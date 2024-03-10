const User = require("../models/user");

//rendering register page(GET)
module.exports.renderRegister = (req, res) => {
  res.render("users/register");
};

//getting data from register page (POST)
module.exports.register = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Yelp Camp!");
      res.redirect("/campgrounds");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/register");
  }
};

//renders login page (GET)
module.exports.renderLogin = (req, res) => {
  res.render("users/login");
};

//getting data from login page (POST)
module.exports.login = (req, res) => {
  req.flash("success", "Welcome back");
  const redirectUrl = req.session.returnTo || "/campgrounds";
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};

//logout (GET)
module.exports.logout = (req, res) => {
  req.logout();
  req.flash("success", "Good bye, come again.");
  res.redirect("/campgrounds");
};
