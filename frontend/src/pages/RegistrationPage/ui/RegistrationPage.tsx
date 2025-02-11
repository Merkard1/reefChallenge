import React, { useState, FormEvent, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link as MuiLink,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getUser,
  getUserError,
  getUserStatus,
  registerUser,
} from "@/entities/User";
import { AppDispatch } from "@/app/providers/StoreProvider";
import { getRouteLogin, getRouteProducts } from "@/shared/const/router";

const RegistrationPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const user = useSelector(getUser);
  const error = useSelector(getUserError);
  const status = useSelector(getUserStatus);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user) {
      navigate(getRouteProducts(), { replace: true });
    }
  }, [user, navigate]);

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const resultAction = await dispatch(
        registerUser({ firstName, lastName, email, password })
      );
      if (registerUser.fulfilled.match(resultAction)) {
        navigate(getRouteProducts(), { replace: true });
      }
    } catch (err: any) {
      console.error(err.message || "Registration failed");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={8} p={4} border={1} borderRadius={2} borderColor="grey.300">
        <Typography variant="h4" align="center" gutterBottom>
          Registration
        </Typography>
        {status === "failed" && error && (
          <Typography color="error" align="center" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <form onSubmit={handleRegister}>
          <TextField
            label="First Name"
            variant="outlined"
            fullWidth
            margin="normal"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <TextField
            label="Last Name"
            variant="outlined"
            fullWidth
            margin="normal"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={status === "loading"}
            sx={{ mt: 2 }}
          >
            {status === "loading" ? "Registering..." : "Register"}
          </Button>
        </form>
        <Typography align="center" sx={{ mt: 2 }}>
          Already have an account?{" "}
          <MuiLink component={Link} to={getRouteLogin()} variant="body2">
            Login
          </MuiLink>
        </Typography>
      </Box>
    </Container>
  );
};

export default RegistrationPage;
