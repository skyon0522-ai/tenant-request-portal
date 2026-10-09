import type { CollectionConfig } from 'payload'

import { ensureUniqueSlug } from './hooks/ensureUniqueSlug'
import { superAdminOrTenantAdminAccess } from '@/collections/Pages/access/superAdminOrTenantAdmin'
import { getUserTenantIDs } from '@/utilities/getUserTenantIDs'
import { isSuperAdmin } from '@/access/isSuperAdmin'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Request', plural: 'Requests' },
  versions: { maxPerDoc: 20 },
  access: {
    create: ({ req }) => isSuperAdmin(req.user) || getUserTenantIDs(req.user).length > 0,
    delete: () => false,
    read: ({ req }) => Boolean(req.user),
    readVersions: ({ req }) => Boolean(req.user),
    update: superAdminOrTenantAdminAccess,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      label: 'Subject',
      type: 'text',
      required: true,
      maxLength: 120,
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
      maxLength: 4000,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      required: true,
      options: ['new', 'in_progress', 'closed'],
      access: { create: () => false },
    },
    {
      name: 'response',
      type: 'textarea',
      maxLength: 4000,
      access: { create: () => false },
    },
    {
      name: 'slug',
      label: 'Reference',
      type: 'text',
      required: true,
      maxLength: 80,
      defaultValue: 'home',
      hooks: {
        beforeValidate: [ensureUniqueSlug],
      },
      index: true,
    },
  ],
}
