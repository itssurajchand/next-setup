import { getServerMode } from "@/@core/utils/serverHelpers"
import ProfileUnapproved from "@/views/ProfileUnapproved"

const Unapproved = () => {
    const mode = getServerMode()
    return (
        <ProfileUnapproved mode={mode} />
    )
}

export default Unapproved
