export function toPublicJson(_doc: unknown, ret: Record<string, any>) {
  ret.id = String(ret._id);
  delete ret._id;
  delete ret.__v;
  if (ret.placeId) {
    ret.placeId = String(ret.placeId);
  }
  return ret;
}
