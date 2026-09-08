/** Product detail (PRD 11.4) and artisan profile (PRD 11.5). */
export const catalog = {
  product: {
    /** {id} is replaced at call time; placeholder copy until Increment 10. */
    detailTitle: 'Product {id}',
  },

  artisan: {
    /** {id} is replaced at call time; placeholder copy until Increment 11. */
    profileTitle: 'Artisan {id}',
  },
} as const
