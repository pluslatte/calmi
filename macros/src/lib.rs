use proc_macro::TokenStream;
use quote::quote;
use syn::{
    DeriveInput, Field, FieldMutability, Ident, Visibility, parse_macro_input, parse_quote, token,
};

// 参考： https://zenn.dev/tak_iwamoto/articles/890771ea5b8ad3

#[proc_macro_derive(Object)]
pub fn object_derive(input: TokenStream) -> TokenStream {
    let input = parse_macro_input!(input as DeriveInput);
    match generate_object_fields(&input) {
        Ok(generated) => generated,
        Err(err) => err.to_compile_error().into(),
    }
}

fn generate_object_fields(derive_input: &DeriveInput) -> Result<TokenStream, syn::Error> {
    let struct_data = match &derive_input.data {
        syn::Data::Struct(value) => value,
        _ => {
            return Err(syn::Error::new_spanned(
                &derive_input.ident,
                "Must be struct type",
            ));
        }
    };

    let fields = struct_data.fields.iter().collect::<Vec<_>>();
    let mut new_fields = fields.clone();

    let field_context = Field {
        attrs: vec![
            parse_quote!(#[serde(rename = "@context", skip_serializing_if = "Option::is_none")]),
        ],
        vis: Visibility::Public(token::Pub::default()),
        mutability: FieldMutability::None,
        ident: Some(Ident::new("context", proc_macro2::Span::call_site())),
        colon_token: Some(syn::token::Colon::default()),
        ty: syn::parse_quote!(Option<Vec<String>>),
    };
    let field_id = Field {
        attrs: vec![],
        vis: Visibility::Public(token::Pub::default()),
        mutability: FieldMutability::None,
        ident: Some(Ident::new("id", proc_macro2::Span::call_site())),
        colon_token: Some(syn::token::Colon::default()),
        ty: syn::parse_quote!(String),
    };
    let field_type = Field {
        attrs: vec![parse_quote!(#[serde(rename = "type")])],
        vis: Visibility::Public(token::Pub::default()),
        mutability: FieldMutability::None,
        ident: Some(Ident::new("r#type", proc_macro2::Span::call_site())),
        colon_token: Some(token::Colon::default()),
        ty: syn::parse_quote!(String),
    };
    new_fields.push(&field_context);
    new_fields.push(&field_id);
    new_fields.push(&field_type);

    let expanded = quote! {
        #[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
        #[serde(rename_all = "camelCase")]
        pub struct #derive_input.ident {
            #(#new_fields),*
        }
    };

    Ok(expanded.into())
}
