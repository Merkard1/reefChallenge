import React, { FormEvent, useState, useEffect } from "react";
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
import { getUserError, getUserStatus, loginUser } from "@/entities/User";
import { AppDispatch } from "@/app/providers/StoreProvider";
import {
  getRouteProducts,
  getRouteRegistration,
  getRouteLogin,
} from "@/shared/const/router";
import { useUser } from "@/entities/User";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const user = useUser();
  const error = useSelector(getUserError);
  const status = useSelector(getUserStatus);

  useEffect(() => {
    if (user) {
      navigate(getRouteProducts(), { replace: true });
    }
  }, [user, navigate]);

  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const resultAction = await dispatch(loginUser({ email, password }));
      if (loginUser.fulfilled.match(resultAction)) {
        navigate(getRouteProducts(), { replace: true });
      }
    } catch (err: any) {
      console.log(err.message || "Login failed");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={8} p={4} border={1} borderRadius={2} borderColor="grey.300">
        <Typography variant="h4" align="center" gutterBottom>
          Login
        </Typography>
        {status === "failed" && error && (
          <Typography color="error" align="center" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <form onSubmit={handleSubmit}>
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
            {status === "loading" ? "Logging in..." : "Login"}
          </Button>
        </form>
        <Typography align="center" sx={{ mt: 2 }}>
          Don’t have an account?{" "}
          <MuiLink component={Link} to={getRouteRegistration()} variant="body2">
            Register
          </MuiLink>
        </Typography>
      </Box>
    </Container>
  );
};

export default LoginPage;
