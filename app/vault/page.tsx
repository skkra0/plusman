import Cmp from "@/components/cmp";
import WithAuth from "@/components/with-auth";
import AddLoginModal from "./add-login-modal";

export default function Vault() {
    return <WithAuth>
        <AddLoginModal/>
    </WithAuth>
}