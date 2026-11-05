import { http } from "./client";
import { EP } from "./endpoints";

export const sessionsApi = {
  list:           ()                  => http.get(EP.sessions()),
  get:            (id)                => http.get(EP.sessionById(id)),
  findByCode:     (code)              => http.get(EP.sessionByCode(code)),
  create:         (payload)           => http.post(EP.sessions(), payload),
  update:         (id, patch)         => http.patch(EP.sessionById(id), patch),
  remove:         (id)                => http.del(EP.sessionById(id)),

  replaceQuestions: (id, questions)   => http.put(EP.sessionQuestions(id), questions),
  addQuestion:      (id, q)           => http.post(EP.sessionQuestions(id), q),
  updateQuestion:   (id, qid, patch)  => http.patch(EP.sessionQuestion(id, qid), patch),
  removeQuestion:   (id, qid)         => http.del(EP.sessionQuestion(id, qid)),

  uploadFile:     (id, file)          => {
    const fd = new FormData(); fd.append("file", file);
    return http.upload(EP.sessionFiles(id), fd);
  },
  removeFile:     (id, fid)           => http.del(EP.sessionFile(id, fid)),
};