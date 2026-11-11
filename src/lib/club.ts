import data from '../data/club.json';
import { Club, check } from './schema';

// Pages read club links through here, so an unsafe link fails the build instead of reaching an href.
check(Club, data, 'src/data/club.json');
export default data;
