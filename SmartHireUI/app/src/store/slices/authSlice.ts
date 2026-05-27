import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { UserProfile } from '@services/api/types'
import { keycloakService } from '@services/auth/keycloak'
import { tokenManager } from '@services/auth/tokenManager'
import { UserRole } from '@services/auth/roleService'

export interface AuthState {
  user: UserProfile | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  roles: UserRole[]
}

const initialState: AuthState = {
  user: null,
  token: tokenManager.getAccessToken(),
  isAuthenticated: !!tokenManager.getAccessToken() && !tokenManager.isTokenExpired(),
  isLoading: false,
  error: null,
  roles: [],
}

/**
 * Async thunk: Login user
 */
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (_, { rejectWithValue }) => {
    try {
      await keycloakService.login()
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Login failed'
      )
    }
  }
)

/**
 * Async thunk: Logout user
 */
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await keycloakService.logout()
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Logout failed'
      )
    }
  }
)

/**
 * Async thunk: Fetch user roles
 */
export const fetchUserRoles = createAsyncThunk(
  'auth/fetchUserRoles',
  async (_, { rejectWithValue }) => {
    try {
      const profile = keycloakService.getUserProfile()
      if (!profile) {
        throw new Error('Failed to fetch user profile')
      }
      return profile.roles
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch roles'
      )
    }
  }
)

/**
 * Auth slice
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Set authentication state directly
     */
    setAuthState: (
      state,
      action: PayloadAction<{
        user: UserProfile | null
        token: string | null
        roles: UserRole[]
      }>
    ) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.roles = action.payload.roles
      state.isAuthenticated = !!action.payload.token
      state.error = null
    },

    /**
     * Clear authentication state
     */
    clearAuth: (state) => {
      state.user = null
      state.token = null
      state.roles = []
      state.isAuthenticated = false
      state.error = null
      tokenManager.clear()
    },

    /**
     * Set error
     */
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state) => {
        state.isLoading = false
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false
        state.user = null
        state.token = null
        state.roles = []
        state.isAuthenticated = false
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Fetch roles
    builder
      .addCase(fetchUserRoles.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchUserRoles.fulfilled, (state, action) => {
        state.isLoading = false
        state.roles = action.payload as UserRole[]
      })
      .addCase(fetchUserRoles.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { setAuthState, clearAuth, setError } = authSlice.actions

export default authSlice.reducer
