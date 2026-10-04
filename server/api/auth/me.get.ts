import { currentUser } from '../../utils/auth'
export default defineEventHandler(event=>currentUser(event))
