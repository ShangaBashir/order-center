import mongoose, { Schema, Document } from 'mongoose';

export interface IWebsiteContentDoc extends Document {
  contentKey: string;
  data: any;
  updatedAt: Date;
}

const WebsiteContentSchema: Schema = new Schema(
  {
    contentKey: { type: String, required: true, unique: true, default: 'main_website_content' },
    data: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IWebsiteContentDoc>('WebsiteContent', WebsiteContentSchema);
