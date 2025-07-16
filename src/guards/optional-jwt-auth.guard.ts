import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
    // Override handleRequest to not throw error when no user is found
    handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
        // If there's an error or no user, just return null (don't throw)
        // This allows the request to continue without authentication
        if (err || !user) {
            return null;
        }
        return user;
    }

    // Override canActivate to always return true (allow request to continue)
    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            // Try to run the JWT strategy
            const result = await super.canActivate(context);
            return true; // Always allow the request to continue, regardless of JWT validation result
        } catch (error) {
            // If JWT validation fails, still allow the request to continue
            return true;
        }
    }
}
