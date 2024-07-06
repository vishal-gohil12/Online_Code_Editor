import Avatar from 'react-avatar';

export const Client = ({name} : {name: string | null})  =>{
    const avatarName = name ? name.charAt(0) : ' ';
    const displayName = name ?? 'Guest';
    return(
        <div className='flex'>
            <div>
                <Avatar name={avatarName} size={"40"}  round="20px" className='m-2'/>
                <p className='pl-5 pt-2'>{displayName}</p>
            </div>
        </div>
    )
}
