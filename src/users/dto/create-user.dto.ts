import { ApiProperty } from '@nestjs/swagger'

export class CreateUserDto {
  @ApiProperty({
    example: 'Paulo Salvatore',
    description: `O nome será utilizado para qualquer coisa (Perfil, Home Page, etc) que precise exibir informações da pessoa conectada.`,
  })
  name!: string

  @ApiProperty({
    example: 'email@email.com',
    description: `O e-mail é necessário apra o login, mas não necessariamente precisa ser o mesmo e-mail da rede social que estiver conectada. Login sem rede social precisa de uma senha.`,
  })
  email!: string

  @ApiProperty({
    example: '123@abc',
    description: `É possível conectar com redes sociais sem uma senha, mas para login usando o e-mail diretamente é necessário informar uma senha.`,
  })
  password?: string
}
