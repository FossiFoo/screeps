export default class Controller {
    level: number;
    progress: number;
    progressTotal: number;
    reservation: ReservationDefinition;
    ticksToDowngrade: number;
    unclaim() {return 0;}
}
