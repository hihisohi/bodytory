import type { NextApiRequest, NextApiResponse } from "next";
import client from "utils/server/client";
import withHandler from "@utils/server/withHandler";
import { withApiSession } from "@utils/server/withSession";
import { LoginForm } from "pages/auth/login";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await loginByOrigin(req, res);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : (<Object>error).toString();
    return res.status(401).send(errorMessage);
  }
};

async function loginByOrigin(req: NextApiRequest, res: NextApiResponse) {
  const { accountId, password }: LoginForm = req.body;
  let foundUser = await client.hospital.findFirst({
    where: {
      name: accountId,
      password,
    },
  });
  if (!foundUser) {
    throw new Error("회원정보를 확인해주세요");
  }
  const { id, name } = foundUser;

  req.session.user = {
    id: foundUser.id,
  };
  await req.session.save();
  return res.status(201).json({ id, name });
}

export default withApiSession(withHandler({ methods: ["POST"], handler, isPrivate: false }));
