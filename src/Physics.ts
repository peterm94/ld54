import {Collider, CollisionSystem, Component, LagomType, Rigidbody} from "lagom-engine";

export class DiscreteRbodyCollisionSystem extends CollisionSystem
{
    types = (): LagomType<Component>[] => [Rigidbody, Collider];

    update(_: number): void
    {
        // This system operates in the fixed update.
    }

    fixedUpdate(delta: number): void
    {
        super.fixedUpdate(delta);

        this.runOnComponentsWithSystem((system: DiscreteRbodyCollisionSystem, bodies: Rigidbody[], colliders: Collider[]) => {

            // Update actual positions using the rigidbody positions and clear pending movement.
            for (const body of bodies) {
                body.parent.transform.x += body.pendingX;
                body.parent.transform.y += body.pendingY;
                body.parent.transform.rotation += body.pendingRotation;
                body.pendingX = 0;
                body.pendingY = 0;
                body.pendingRotation = 0;
            }

            // Move them all to their new positions. This uses the current transform position.
            for (const collider of colliders)
            {
                collider.updatePosition();
            }

            // Do a detect update.
            system.detectSystem.update();

            // Do collision checks.
            this.doCollisionCheck(colliders);
        });
    }
}